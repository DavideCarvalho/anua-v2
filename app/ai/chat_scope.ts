import db from '@adonisjs/lucid/services/db'
import type { ChatPersonaRole } from './chat_role.js'

/**
 * Escopo de dados que cada papel pode acessar no chat. Calculado uma vez por
 * request e injetado no contexto das tools — todas as queries DEVEM filtrar
 * por esses ids antes de chegar ao banco. Não dá pra confiar no modelo pra
 * lembrar de filtrar; o filtro é aplicado no código da tool.
 *
 * Convenção:
 * - gestor: classIds/subjectIds/studentIds vazios = "todos da escola"
 * - coordenador: classIds = turmas que ele coordena
 * - professor: classIds = turmas onde dá aula + subjectIds das matérias
 * - responsavel: studentIds = união pedagógico ∪ financeiro; as duas listas
 *   particionadas existem em studentIdsPedagogical / studentIdsFinancial pra
 *   tools poderem restringir por papel do vínculo (uma responsável pedagógica
 *   não vê boletos; uma só-financeira não vê notas/frequência).
 */
export type ChatScope = {
  role: ChatPersonaRole
  schoolId: string
  classIds: string[]
  subjectIds: string[]
  studentIds: string[]
  // Subconjuntos só relevantes pra responsavel — pra outros papéis ficam
  // vazios (gestor passa direto via role check, professor/coordenador não
  // têm essa noção). Quando role !== 'responsavel', tools devem usar
  // studentIds direto.
  studentIdsPedagogical: string[]
  studentIdsFinancial: string[]
  // Hint contextual sobre a tela onde o usuário está. NÃO é usado para
  // autorização — é só passado ao system prompt do persona pra que o
  // assistente saiba "o usuário está olhando essa visão" e use os ids
  // como filtros implícitos quando ele se referir a "essa turma" / "esse
  // período". As tools continuam validando contra classIds/studentIds do
  // próprio scope (fonte de verdade).
  screen?: {
    id: string
    filters?: Record<string, string>
  }
}

export async function computeChatScope(args: {
  role: ChatPersonaRole
  userId: string
  schoolId: string
}): Promise<ChatScope> {
  const { role, userId, schoolId } = args
  const base: ChatScope = {
    role,
    schoolId,
    classIds: [],
    subjectIds: [],
    studentIds: [],
    studentIdsPedagogical: [],
    studentIdsFinancial: [],
  }

  if (role === 'gestor') return base

  if (role === 'professor') {
    const { rows: classRows } = await db.rawQuery<{
      rows: Array<{ classId: string; subjectId: string }>
    }>(
      `
        SELECT DISTINCT thc."classId" AS "classId", thc."subjectId" AS "subjectId"
        FROM "TeacherHasClass" thc
        JOIN "Class" c ON c.id = thc."classId"
        WHERE thc."teacherId" = :userId
          AND thc."isActive" = true
          AND c."isArchived" = false
          AND c."schoolId" = :schoolId
      `,
      { userId, schoolId }
    )

    const classIds = Array.from(new Set(classRows.map((r) => r.classId)))
    const subjectIds = Array.from(new Set(classRows.map((r) => r.subjectId).filter(Boolean)))
    const studentIds = await studentIdsForClasses(classIds)
    return { ...base, classIds, subjectIds, studentIds }
  }

  if (role === 'coordenador') {
    // Coordenador é vinculado a um nível via LACHA (level assigned to
    // course-has-academic-period). Filtramos LACHA.isActive pra pegar apenas
    // os vínculos do período letivo corrente, depois trazemos as turmas
    // daquele nível.
    const { rows } = await db.rawQuery<{ rows: Array<{ classId: string }> }>(
      `
        SELECT DISTINCT c.id AS "classId"
        FROM "CoordinatorHasLevel" chl
        JOIN "LevelAssignedToCourseHasAcademicPeriod" lacha
          ON lacha.id = chl."levelAssignedToCourseHasAcademicPeriodId"
        JOIN "Class" c ON c."levelId" = lacha."levelId"
        WHERE chl."coordinatorId" = :userId
          AND lacha."isActive" = true
          AND c."isArchived" = false
          AND c."schoolId" = :schoolId
      `,
      { userId, schoolId }
    )

    const classIds = rows.map((r) => r.classId)
    const studentIds = await studentIdsForClasses(classIds)
    return { ...base, classIds, studentIds }
  }

  if (role === 'responsavel') {
    // Buscamos por (studentId, flags) — o vínculo pode ter qualquer combinação
    // das duas flags. Mesmo aluno pode aparecer várias vezes se o usuário
    // tiver mais de um StudentHasResponsible (não é o padrão, mas o schema
    // permite). Agregamos com OR pra "qualquer vínculo pedagógico habilita
    // o pedagógico, qualquer financeiro habilita o financeiro".
    const { rows } = await db.rawQuery<{
      rows: Array<{ studentId: string; isPedagogical: boolean; isFinancial: boolean }>
    }>(
      `
        SELECT shr."studentId",
               BOOL_OR(shr."isPedagogical") AS "isPedagogical",
               BOOL_OR(shr."isFinancial")   AS "isFinancial"
        FROM "StudentHasResponsible" shr
        WHERE shr."responsibleId" = :userId
        GROUP BY shr."studentId"
      `,
      { userId }
    )
    const studentIds = rows.map((r) => r.studentId)
    const studentIdsPedagogical = rows.filter((r) => r.isPedagogical).map((r) => r.studentId)
    const studentIdsFinancial = rows.filter((r) => r.isFinancial).map((r) => r.studentId)
    // classIds só sai do pedagógico — info de turma (atividades, provas,
    // comunicados, lista de alunos) é pedagógica por definição. Responsável
    // só-financeiro fica com classIds=[] e denyIfClassOutOfScope barra.
    const classIds = await classIdsForStudents(studentIdsPedagogical)
    return { ...base, studentIds, studentIdsPedagogical, studentIdsFinancial, classIds }
  }

  return base
}

async function classIdsForStudents(studentIds: string[]): Promise<string[]> {
  if (studentIds.length === 0) return []
  const { rows } = await db.rawQuery<{ rows: Array<{ classId: string }> }>(
    `
      SELECT DISTINCT s."classId"
      FROM "Student" s
      WHERE s.id = ANY(:studentIds)
        AND s."classId" IS NOT NULL
    `,
    { studentIds }
  )
  return rows.map((r) => r.classId)
}

async function studentIdsForClasses(classIds: string[]): Promise<string[]> {
  if (classIds.length === 0) return []
  const { rows } = await db.rawQuery<{ rows: Array<{ id: string }> }>(
    `
      SELECT DISTINCT s.id
      FROM "Student" s
      JOIN "User" u ON u.id = s.id
      WHERE s."classId" = ANY(:classIds)
        AND u."deletedAt" IS NULL
    `,
    { classIds }
  )
  return rows.map((r) => r.id)
}
