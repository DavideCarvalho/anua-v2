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
 * - responsavel: studentIds = filhos vinculados
 */
export type ChatScope = {
  role: ChatPersonaRole
  schoolId: string
  classIds: string[]
  subjectIds: string[]
  studentIds: string[]
}

export async function computeChatScope(args: {
  role: ChatPersonaRole
  userId: string
  schoolId: string
}): Promise<ChatScope> {
  const { role, userId, schoolId } = args
  const base: ChatScope = { role, schoolId, classIds: [], subjectIds: [], studentIds: [] }

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
    return { ...base, classIds, subjectIds }
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

    return { ...base, classIds: rows.map((r) => r.classId) }
  }

  if (role === 'responsavel') {
    const { rows } = await db.rawQuery<{ rows: Array<{ studentId: string }> }>(
      `
        SELECT DISTINCT shr."studentId"
        FROM "StudentHasResponsible" shr
        WHERE shr."responsibleId" = :userId
      `,
      { userId }
    )
    return { ...base, studentIds: rows.map((r) => r.studentId) }
  }

  return base
}
