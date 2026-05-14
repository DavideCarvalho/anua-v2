import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { v7 as uuidv7 } from 'uuid'
import logger from '@adonisjs/core/services/logger'
import StudentHasResponsible from '#models/student_has_responsible'
import {
  sendCommunicationInputSchema,
  type SendCommunicationInput,
} from './tools/send_communication.js'
import {
  justifyAbsenceInputSchema,
  type JustifyAbsenceInput,
} from './tools/justify_absence.js'
import {
  enterExamGradeInputSchema,
  type EnterExamGradeInput,
} from './tools/enter_exam_grade.js'

/**
 * Contexto da decisão: quem aprovou, dados do row pendente, escola alvo.
 * O dispatcher usa schoolId daqui pra escopar todas as queries ao tenant
 * correto, mesmo que o input tenha vindo cru do modelo.
 */
export type DispatchContext = {
  toolCallId: string
  toolName: string
  input: unknown
  threadId: string
  schoolId: string | null
  decidedByUserId: string
}

export type DispatchResult =
  | { ok: true; output: unknown }
  | { ok: false; error: string }

/**
 * Executa a ação correspondente a uma tool de escrita aprovada. Cada nome
 * de tool tem um handler que valida o input com o mesmo zod schema usado
 * pela definição da tool e executa o efeito.
 */
export async function dispatchAction(ctx: DispatchContext): Promise<DispatchResult> {
  try {
    switch (ctx.toolName) {
      case 'sendCommunication':
        return await dispatchSendCommunication(ctx)
      case 'justifyAbsence':
        return await dispatchJustifyAbsence(ctx)
      case 'enterExamGrade':
        return await dispatchEnterExamGrade(ctx)
      default:
        return { ok: false, error: `Ação não suportada: ${ctx.toolName}` }
    }
  } catch (err) {
    logger.error({ err, ctx }, 'dispatchAction failed')
    return { ok: false, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

async function dispatchSendCommunication(ctx: DispatchContext): Promise<DispatchResult> {
  if (!ctx.schoolId) {
    return { ok: false, error: 'Thread sem escola vinculada — não dá pra enviar comunicado' }
  }

  // Revalida com o mesmo zod do tool def — se o modelo inventou algo fora
  // do contrato, a aprovação falha aqui em vez de bater no banco.
  const parsed = sendCommunicationInputSchema.safeParse(ctx.input)
  if (!parsed.success) {
    return {
      ok: false,
      error: `Input inválido: ${parsed.error.issues.map((i) => i.message).join('; ')}`,
    }
  }
  const input: SendCommunicationInput = parsed.data

  // CLASS/LEVEL precisam de scopeId; SCHOOL omite.
  if (input.audience.scopeType !== 'SCHOOL' && !input.audience.scopeId) {
    return {
      ok: false,
      error: `audience.scopeId é obrigatório quando scopeType é ${input.audience.scopeType}`,
    }
  }

  const announcementId = uuidv7()
  const audienceId = uuidv7()

  await db.transaction(async (trx) => {
    await trx.insertQuery().table('SchoolAnnouncement').insert({
      id: announcementId,
      schoolId: ctx.schoolId,
      title: input.title,
      body: input.body,
      status: 'PUBLISHED',
      requiresAcknowledgement: input.requiresAcknowledgement ?? false,
      publishedAt: DateTime.now().toSQL(),
      createdByUserId: ctx.decidedByUserId,
      createdAt: DateTime.now().toSQL(),
      updatedAt: DateTime.now().toSQL(),
    })

    await trx.insertQuery().table('SchoolAnnouncementAudience').insert({
      id: audienceId,
      announcementId,
      scopeType: input.audience.scopeType,
      scopeId: input.audience.scopeId ?? ctx.schoolId,
      createdAt: DateTime.now().toSQL(),
    })

    // Por enquanto não criamos rows em SchoolAnnouncementRecipient
    // automaticamente — o fluxo de notificação existente da plataforma
    // (que já é acionado por triggers/jobs) cuida da entrega. A intenção
    // aqui é: o comunicado existe e está publicado; o resto segue pela
    // pipeline padrão.
  })

  return {
    ok: true,
    output: {
      announcementId,
      scopeType: input.audience.scopeType,
      scopeId: input.audience.scopeId ?? ctx.schoolId,
      title: input.title,
      publishedAt: DateTime.now().toISO(),
    },
  }
}

async function dispatchJustifyAbsence(ctx: DispatchContext): Promise<DispatchResult> {
  const parsed = justifyAbsenceInputSchema.safeParse(ctx.input)
  if (!parsed.success) {
    return {
      ok: false,
      error: `Input inválido: ${parsed.error.issues.map((i) => i.message).join('; ')}`,
    }
  }
  const input: JustifyAbsenceInput = parsed.data

  // Defesa em profundidade: o scope check do tool já valida no fluxo normal,
  // mas o dispatcher é o ponto final antes do banco — confirmamos aqui que
  // quem aprovou tem vínculo pedagógico com o aluno. Se alguém burlar a
  // camada de aprovação ou se o vínculo mudou entre a emissão e a aprovação,
  // morre aqui.
  const link = await StudentHasResponsible.query()
    .where('studentId', input.studentId)
    .where('responsibleId', ctx.decidedByUserId)
    .where('isPedagogical', true)
    .first()
  if (!link) {
    return {
      ok: false,
      error:
        'Sem vínculo pedagógico com esse aluno — apenas o responsável pedagógico pode justificar faltas.',
    }
  }

  // Aplica em todas as faltas (ABSENT) do dia. Usa returning('id') pra saber
  // quantas foram afetadas — knex no PG retorna o array das rows updated.
  const updated = await db
    .from('StudentHasAttendance')
    .where('studentId', input.studentId)
    .where('status', 'ABSENT')
    .whereIn('attendanceId', (sub) => {
      sub.from('Attendance').select('id').whereRaw(`date::date = ?::date`, [input.date])
    })
    .update(
      {
        status: 'EXCUSED',
        justification: input.reason,
        updatedAt: DateTime.now().toSQL(),
      },
      ['id']
    )

  if (updated.length === 0) {
    return {
      ok: false,
      error: `Sem faltas pra justificar em ${input.date} pra esse aluno.`,
    }
  }

  return {
    ok: true,
    output: {
      studentId: input.studentId,
      date: input.date,
      justifiedCount: updated.length,
      reason: input.reason,
    },
  }
}

async function dispatchEnterExamGrade(ctx: DispatchContext): Promise<DispatchResult> {
  const parsed = enterExamGradeInputSchema.safeParse(ctx.input)
  if (!parsed.success) {
    return {
      ok: false,
      error: `Input inválido: ${parsed.error.issues.map((i) => i.message).join('; ')}`,
    }
  }
  const input: EnterExamGradeInput = parsed.data

  if (input.absent === true && input.score !== null) {
    return { ok: false, error: 'Quando absent=true, score precisa ser null.' }
  }
  if (input.absent !== true && input.score === null) {
    return { ok: false, error: 'Score só pode ser null se o aluno faltou (absent=true).' }
  }

  // Validação cruzada: a prova pertence a uma TeacherHasClass que o professor
  // que está aprovando realmente leciona; o aluno pertence à mesma classe.
  // Defesa em profundidade — o scope no chat já filtra, mas re-checamos aqui.
  type AccessRow = { classId: string; teacherId: string; studentClassId: string | null }
  const { rows } = await db.rawQuery<{ rows: AccessRow[] }>(
    `
      SELECT thc."classId"     AS "classId",
             thc."teacherId"   AS "teacherId",
             s."classId"       AS "studentClassId"
      FROM "Exam" e
      JOIN "TeacherHasClass" thc ON thc.id = e."teacherHasClassId"
      LEFT JOIN "Student" s ON s.id = :studentId
      WHERE e.id = :examId
      LIMIT 1
    `,
    { examId: input.examId, studentId: input.studentId }
  )
  const access = rows[0]
  if (!access) {
    return { ok: false, error: 'Prova não encontrada.' }
  }
  if (access.teacherId !== ctx.decidedByUserId) {
    return {
      ok: false,
      error: 'Apenas o professor que ministra essa prova pode lançar a nota.',
    }
  }
  if (access.studentClassId !== access.classId) {
    return {
      ok: false,
      error: 'O aluno não pertence à turma dessa prova.',
    }
  }

  // Upsert: existe → update; não existe → insert. Sem race aqui porque a
  // primary key é id (UUID v7) e o lookup por (examId, studentId) é único
  // no domínio (1 nota por aluno por prova).
  const existing = await db
    .from('exam_grades')
    .where('examId', input.examId)
    .where('studentId', input.studentId)
    .select('id')
    .first()

  const now = DateTime.now().toSQL()
  const isPresent = input.absent !== true

  if (existing) {
    await db
      .from('exam_grades')
      .where('id', existing.id)
      .update({
        score: input.score,
        attended: isPresent,
        feedback: input.feedback ?? null,
        gradedAt: now,
        updatedAt: now,
      })
    return {
      ok: true,
      output: {
        examGradeId: existing.id,
        examId: input.examId,
        studentId: input.studentId,
        score: input.score,
        absent: !isPresent,
        action: 'updated',
      },
    }
  }

  const newId = uuidv7()
  await db.table('exam_grades').insert({
    id: newId,
    examId: input.examId,
    studentId: input.studentId,
    score: input.score,
    attended: isPresent,
    feedback: input.feedback ?? null,
    gradedAt: now,
    createdAt: now,
    updatedAt: now,
  })

  return {
    ok: true,
    output: {
      examGradeId: newId,
      examId: input.examId,
      studentId: input.studentId,
      score: input.score,
      absent: !isPresent,
      action: 'created',
    },
  }
}
