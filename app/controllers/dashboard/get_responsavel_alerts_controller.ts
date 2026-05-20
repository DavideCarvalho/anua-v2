import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import StudentHasResponsible from '#models/student_has_responsible'
import AppException from '#exceptions/app_exception'

/**
 * Insights do /responsavel (análogo a get_pedagogical_alerts pro /escola).
 *
 * Retorna 5 categorias de alerta agregadas pros filhos do responsável:
 *  1. pendingAssignments — atividades sem nota com prazo até fim da semana
 *  2. weeklyAttendance   — frequência dos últimos 7 dias
 *  3. newGrades          — notas lançadas nos últimos 7 dias
 *  4. unreadCommunications — comunicados pendentes de ciência
 *  5. openInvoices       — boletos abertos/atrasados (só se houver vínculo financeiro)
 *
 * Cada categoria devolve count + breakdown por filho. O frontend decide o
 * que renderizar baseado em count > 0 (ou perfectWeek pra frequência).
 *
 * Filtro por studentId: quando passado via query param, valida que o aluno
 * está no escopo do responsavel (StudentHasResponsible) e restringe todos os
 * counts a esse filho. Sem o param, agrega across todos os filhos.
 */

interface StudentInfo {
  name: string
  isPedagogical: boolean
  isFinancial: boolean
}

type Breakdown<Extra extends Record<string, unknown>> = {
  studentId: string
  studentName: string
} & Extra

interface PendingAssignmentsAlert {
  count: number
  breakdown: Breakdown<{ count: number }>[]
}

interface WeeklyAttendanceAlert {
  absences: number
  total: number
  perfectWeek: boolean
  breakdown: Breakdown<{ absences: number; total: number }>[]
}

interface NewGradesAlert {
  count: number
  lastGrade: { studentName: string; subject: string; score: number; maxScore: number } | null
  breakdown: Breakdown<{ count: number }>[]
}

interface UnreadCommunicationsAlert {
  count: number
  lastTitle: string | null
  breakdown: Breakdown<{ count: number }>[]
}

interface OpenInvoicesAlert {
  count: number
  totalCents: number
  nextDueDate: string | null
  breakdown: Breakdown<{ count: number; totalCents: number }>[]
}

interface ResponsavelAlertsResponse {
  selectedStudentId: string | null
  alerts: {
    pendingAssignments: PendingAssignmentsAlert
    weeklyAttendance: WeeklyAttendanceAlert | null
    newGrades: NewGradesAlert
    unreadCommunications: UnreadCommunicationsAlert
    openInvoices: OpenInvoicesAlert | null
  }
}

export default class GetResponsavelAlertsController {
  async handle({
    auth,
    effectiveUser,
    request,
  }: HttpContext): Promise<ResponsavelAlertsResponse> {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.invalidCredentials()
    }

    const studentIdParam = (request.qs().studentId as string | undefined) || undefined

    const relations = await StudentHasResponsible.query()
      .where('responsibleId', user.id)
      .preload('student', (q) => q.preload('user'))

    if (relations.length === 0) {
      return emptyResponse(studentIdParam ?? null)
    }

    const studentMap = new Map<string, StudentInfo>()
    for (const r of relations) {
      studentMap.set(r.studentId, {
        name: r.student?.user?.name ?? 'Aluno',
        isPedagogical: r.isPedagogical,
        isFinancial: r.isFinancial,
      })
    }

    let targetIds: string[]
    if (studentIdParam) {
      if (!studentMap.has(studentIdParam)) {
        throw AppException.forbidden('Aluno fora do escopo')
      }
      targetIds = [studentIdParam]
    } else {
      targetIds = Array.from(studentMap.keys())
    }

    const pedIds = targetIds.filter((id) => studentMap.get(id)?.isPedagogical)
    const finIds = targetIds.filter((id) => studentMap.get(id)?.isFinancial)

    const now = DateTime.now()
    const sevenDaysAgo = now.minus({ days: 7 }).toSQL()
    const endOfWeek = now.endOf('week').toSQL()

    const [pending, attendance, newGrades, comunicados, invoices] = await Promise.all([
      this.pendingAssignments(pedIds, endOfWeek!, studentMap),
      this.weeklyAttendance(pedIds, sevenDaysAgo!, studentMap),
      this.newGrades(pedIds, sevenDaysAgo!, studentMap),
      this.unreadCommunications(user.id, targetIds, studentMap),
      this.openInvoices(finIds, studentMap),
    ])

    return {
      selectedStudentId: studentIdParam ?? null,
      alerts: {
        pendingAssignments: pending,
        weeklyAttendance: pedIds.length > 0 ? attendance : null,
        newGrades,
        unreadCommunications: comunicados,
        openInvoices: finIds.length > 0 ? invoices : null,
      },
    }
  }

  /**
   * Atividades sem nota cujo prazo é até o fim da semana corrente. Inclui
   * já vencidas (sem cutoff inferior). Filtro só por pedagogical: pai
   * só-financeiro não enxerga atividades.
   */
  private async pendingAssignments(
    studentIds: string[],
    endOfWeek: string,
    studentMap: Map<string, StudentInfo>
  ): Promise<PendingAssignmentsAlert> {
    if (studentIds.length === 0) return { count: 0, breakdown: [] }

    const { rows } = await db.rawQuery<{
      rows: Array<{ studentId: string; count: string | number }>
    }>(
      `
        SELECT sha."studentId" AS "studentId",
               COUNT(*) AS count
        FROM "StudentHasAssignment" sha
        JOIN "Assignment" a ON sha."assignmentId" = a.id
        WHERE sha."studentId" = ANY(:studentIds)
          AND sha.grade IS NULL
          AND a."dueDate" <= :endOfWeek
        GROUP BY sha."studentId"
      `,
      { studentIds, endOfWeek }
    )

    return aggregateByStudent(rows, studentMap, (r) => ({ count: Number(r.count) }))
  }

  /**
   * Faltas vs total de aulas nos últimos 7 dias. perfectWeek=true quando
   * houve registros e zero faltas — o frontend usa pra celebrar.
   */
  private async weeklyAttendance(
    studentIds: string[],
    sevenDaysAgo: string,
    studentMap: Map<string, StudentInfo>
  ): Promise<WeeklyAttendanceAlert> {
    if (studentIds.length === 0) {
      return { absences: 0, total: 0, perfectWeek: false, breakdown: [] }
    }

    const { rows } = await db.rawQuery<{
      rows: Array<{ studentId: string; absences: string | number; total: string | number }>
    }>(
      `
        SELECT sha."studentId" AS "studentId",
               COUNT(*) FILTER (WHERE sha.status = 'ABSENT') AS absences,
               COUNT(*) AS total
        FROM "StudentHasAttendance" sha
        JOIN "Attendance" a ON sha."attendanceId" = a.id
        WHERE sha."studentId" = ANY(:studentIds)
          AND a."date" >= :sevenDaysAgo
        GROUP BY sha."studentId"
      `,
      { studentIds, sevenDaysAgo }
    )

    let absences = 0
    let total = 0
    const breakdown: Breakdown<{ absences: number; total: number }>[] = []
    for (const row of rows) {
      const abs = Number(row.absences)
      const tot = Number(row.total)
      absences += abs
      total += tot
      breakdown.push({
        studentId: row.studentId,
        studentName: studentMap.get(row.studentId)?.name ?? 'Aluno',
        absences: abs,
        total: tot,
      })
    }

    return {
      absences,
      total,
      perfectWeek: total > 0 && absences === 0,
      breakdown,
    }
  }

  /**
   * Notas lançadas (StudentHasAssignment.updatedAt > 7d, grade não nula).
   * lastGrade traz a mais recente pra o card mostrar "Maria · Matemática · 8.5/10".
   */
  private async newGrades(
    studentIds: string[],
    sevenDaysAgo: string,
    studentMap: Map<string, StudentInfo>
  ): Promise<NewGradesAlert> {
    if (studentIds.length === 0) return { count: 0, lastGrade: null, breakdown: [] }

    const { rows: countRows } = await db.rawQuery<{
      rows: Array<{ studentId: string; count: string | number }>
    }>(
      `
        SELECT sha."studentId" AS "studentId",
               COUNT(*) AS count
        FROM "StudentHasAssignment" sha
        WHERE sha."studentId" = ANY(:studentIds)
          AND sha.grade IS NOT NULL
          AND sha."updatedAt" >= :sevenDaysAgo
        GROUP BY sha."studentId"
      `,
      { studentIds, sevenDaysAgo }
    )

    const agg = aggregateByStudent(countRows, studentMap, (r) => ({ count: Number(r.count) }))

    if (agg.count === 0) {
      return { count: 0, lastGrade: null, breakdown: [] }
    }

    const { rows: lastRows } = await db.rawQuery<{
      rows: Array<{
        studentId: string
        grade: string | number
        maxGrade: string | number
        subject: string | null
      }>
    }>(
      `
        SELECT sha."studentId" AS "studentId",
               sha.grade AS grade,
               a.grade AS "maxGrade",
               s.name AS subject
        FROM "StudentHasAssignment" sha
        JOIN "Assignment" a ON sha."assignmentId" = a.id
        JOIN "TeacherHasClass" thc ON a."teacherHasClassId" = thc.id
        JOIN "Subject" s ON thc."subjectId" = s.id
        WHERE sha."studentId" = ANY(:studentIds)
          AND sha.grade IS NOT NULL
          AND sha."updatedAt" >= :sevenDaysAgo
        ORDER BY sha."updatedAt" DESC
        LIMIT 1
      `,
      { studentIds, sevenDaysAgo }
    )

    const last = lastRows[0]
    return {
      count: agg.count,
      breakdown: agg.breakdown,
      lastGrade: last
        ? {
            studentName: studentMap.get(last.studentId)?.name ?? 'Aluno',
            subject: last.subject ?? 'Sem matéria',
            score: Number(last.grade),
            maxScore: Number(last.maxGrade),
          }
        : null,
    }
  }

  /**
   * Comunicados publicados que exigem ciência e ainda não foram confirmados
   * por esse responsável. Mesma regra do ListPendingAcknowledgements.
   * O breakdown por filho ignora linhas com studentId=null (comunicados gerais).
   */
  private async unreadCommunications(
    responsibleId: string,
    studentIds: string[],
    studentMap: Map<string, StudentInfo>
  ): Promise<UnreadCommunicationsAlert> {
    const { rows } = await db.rawQuery<{
      rows: Array<{ studentId: string | null; title: string; count: string | number }>
    }>(
      `
        SELECT sar."studentId" AS "studentId",
               sa.title AS title,
               COUNT(*) OVER () AS count
        FROM "SchoolAnnouncementRecipient" sar
        JOIN "SchoolAnnouncement" sa ON sa.id = sar."announcementId"
        WHERE sar."responsibleId" = :responsibleId
          AND sar."acknowledgedAt" IS NULL
          AND sa.status = 'PUBLISHED'
          AND sa."requiresAcknowledgement" = true
          AND (sa."acknowledgementDueAt" IS NULL OR sa."acknowledgementDueAt" >= NOW())
        ORDER BY sa."publishedAt" DESC NULLS LAST
      `,
      { responsibleId }
    )

    if (rows.length === 0) {
      return { count: 0, lastTitle: null, breakdown: [] }
    }

    const totalCount = Number(rows[0].count)
    const lastTitle = rows[0].title ?? null

    // breakdown só pra filhos no studentIds atual (filtra quando o usuário
    // selecionou um filho específico via query param)
    const perStudent = new Map<string, number>()
    for (const row of rows) {
      const sid = row.studentId
      if (sid && studentIds.includes(sid)) {
        perStudent.set(sid, (perStudent.get(sid) ?? 0) + 1)
      }
    }

    const breakdown: Breakdown<{ count: number }>[] = []
    for (const [sid, count] of perStudent) {
      breakdown.push({
        studentId: sid,
        studentName: studentMap.get(sid)?.name ?? 'Aluno',
        count,
      })
    }

    return { count: totalCount, lastTitle, breakdown }
  }

  /**
   * Boletos com status OPEN/PENDING/OVERDUE pros filhos com vínculo
   * financeiro. nextDueDate = vencimento mais próximo no futuro (ou null
   * quando só houver atrasados sem dueDate futuro válido).
   */
  private async openInvoices(
    studentIds: string[],
    studentMap: Map<string, StudentInfo>
  ): Promise<OpenInvoicesAlert> {
    if (studentIds.length === 0) {
      return { count: 0, totalCents: 0, nextDueDate: null, breakdown: [] }
    }

    const { rows } = await db.rawQuery<{
      rows: Array<{
        studentId: string
        count: string | number
        totalAmount: string | number
        nextDueDate: string | null
      }>
    }>(
      `
        SELECT i."studentId" AS "studentId",
               COUNT(*) AS count,
               COALESCE(SUM(i."totalAmount"), 0) AS "totalAmount",
               MIN(i."dueDate") FILTER (WHERE i."dueDate" >= CURRENT_DATE) AS "nextDueDate"
        FROM "Invoice" i
        WHERE i."studentId" = ANY(:studentIds)
          AND i.status IN ('OPEN', 'PENDING', 'OVERDUE')
        GROUP BY i."studentId"
      `,
      { studentIds }
    )

    let count = 0
    let totalCents = 0
    let nextDueDate: string | null = null
    const breakdown: Breakdown<{ count: number; totalCents: number }>[] = []

    for (const row of rows) {
      const c = Number(row.count)
      // Invoice.totalAmount já é armazenado em centavos (inteiro) — mesmo
      // tratamento que GetStudentInvoicesController faz. formatCurrency no
      // front divide por 100 pra exibir.
      const cents = Math.round(Number(row.totalAmount))
      count += c
      totalCents += cents
      breakdown.push({
        studentId: row.studentId,
        studentName: studentMap.get(row.studentId)?.name ?? 'Aluno',
        count: c,
        totalCents: cents,
      })
      if (row.nextDueDate && (!nextDueDate || row.nextDueDate < nextDueDate)) {
        nextDueDate = row.nextDueDate
      }
    }

    return { count, totalCents, nextDueDate, breakdown }
  }
}

function aggregateByStudent<T extends { count: number }>(
  rows: Array<{ studentId: string; count: string | number }>,
  studentMap: Map<string, StudentInfo>,
  mapRow: (r: { studentId: string; count: string | number }) => T
): { count: number; breakdown: Breakdown<T>[] } {
  let total = 0
  const breakdown: Breakdown<T>[] = []
  for (const row of rows) {
    const mapped = mapRow(row)
    total += mapped.count
    breakdown.push({
      studentId: row.studentId,
      studentName: studentMap.get(row.studentId)?.name ?? 'Aluno',
      ...mapped,
    })
  }
  return { count: total, breakdown }
}

function emptyResponse(selectedStudentId: string | null): ResponsavelAlertsResponse {
  return {
    selectedStudentId,
    alerts: {
      pendingAssignments: { count: 0, breakdown: [] },
      weeklyAttendance: null,
      newGrades: { count: 0, lastGrade: null, breakdown: [] },
      unreadCommunications: { count: 0, lastTitle: null, breakdown: [] },
      openInvoices: null,
    },
  }
}
