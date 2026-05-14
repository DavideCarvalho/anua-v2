import db from '@adonisjs/lucid/services/db'

/**
 * Resolve a escola "efetiva" de um usuário pra fluxos que não passam pelo
 * impersonation_middleware (ex: webhook WhatsApp).
 *
 * Por que isso existe: `User.schoolId` é populado em runtime pela middleware
 * web (inertia_middleware → user.schoolId = firstSelectedSchoolId). No
 * banco cru, ~83% dos users têm schoolId NULL e dependem de outras tabelas
 * pra associar com a escola:
 *
 *   - office (director/admin/coordenador/canteen): UserHasSchool
 *   - SCHOOL_TEACHER: TeacherHasClass(isActive=true) → Class.schoolId
 *   - STUDENT: StudentHasLevel(deletedAt IS NULL)
 *               → LevelAssignedToCourseHasAcademicPeriod
 *               → CourseHasAcademicPeriod → AcademicPeriod.schoolId
 *   - STUDENT_RESPONSIBLE: StudentHasResponsible → mesma chain do filho.
 *
 * Estratégia de fallback (primeira que resolver, ganha):
 *   1. user.schoolId direto (quando populado, é canônico)
 *   2. UserHasSchool (isDefault DESC pra estabilidade)
 *   3. Fallback por role
 *
 * Confirmação no banco: cobertura combinada chega a 100% de teachers,
 * 96% de responsáveis, 91% de students. Resto são órfãos sem matrícula
 * (seed/test) ou roles globais sem escola (DIRECTOR, SUPER_ADMIN).
 */
export async function resolveSchoolForUser(args: {
  userId: string
  roleName: string | null | undefined
  currentSchoolId: string | null | undefined
}): Promise<string | null> {
  if (args.currentSchoolId) return args.currentSchoolId

  // 2. UserHasSchool — vale pra qualquer role (office majoritariamente).
  type UhsRow = { schoolId: string }
  const { rows: uhsRows } = await db.rawQuery<{ rows: UhsRow[] }>(
    `
      SELECT "schoolId"
      FROM "UserHasSchool"
      WHERE "userId" = :userId
      ORDER BY "isDefault" DESC, "createdAt" ASC
      LIMIT 1
    `,
    { userId: args.userId }
  )
  if (uhsRows.length > 0) return uhsRows[0].schoolId

  if (!args.roleName) return null

  // 3a. Professor: aula ativa.
  if (args.roleName === 'SCHOOL_TEACHER') {
    type Row = { schoolId: string }
    const { rows } = await db.rawQuery<{ rows: Row[] }>(
      `
        SELECT c."schoolId"
        FROM "TeacherHasClass" thc
        JOIN "Class" c ON c.id = thc."classId"
        WHERE thc."teacherId" = :userId
          AND thc."isActive" = true
          AND c."isArchived" = false
        ORDER BY thc."createdAt" DESC
        LIMIT 1
      `,
      { userId: args.userId }
    )
    if (rows.length > 0) return rows[0].schoolId
    return null
  }

  // 3b. Student: matrícula ativa via StudentHasLevel.
  if (args.roleName === 'STUDENT') {
    type Row = { schoolId: string }
    const { rows } = await db.rawQuery<{ rows: Row[] }>(
      `
        SELECT ap."schoolId"
        FROM "StudentHasLevel" shl
        JOIN "LevelAssignedToCourseHasAcademicPeriod" lacha
          ON lacha.id = shl."levelAssignedToCourseAcademicPeriodId"
        JOIN "CourseHasAcademicPeriod" chap
          ON chap.id = lacha."courseHasAcademicPeriodId"
        JOIN "AcademicPeriod" ap ON ap.id = chap."academicPeriodId"
        WHERE shl."studentId" = :userId
          AND shl."deletedAt" IS NULL
        ORDER BY shl."createdAt" DESC
        LIMIT 1
      `,
      { userId: args.userId }
    )
    if (rows.length > 0) return rows[0].schoolId
    return null
  }

  // 3c. Responsável: pega a escola via a matrícula ativa de qualquer filho.
  // Múltiplos filhos sempre na mesma escola (verificado no banco), então
  // pegar a mais recente é suficiente.
  if (args.roleName === 'STUDENT_RESPONSIBLE' || args.roleName === 'RESPONSIBLE') {
    type Row = { schoolId: string }
    const { rows } = await db.rawQuery<{ rows: Row[] }>(
      `
        SELECT ap."schoolId"
        FROM "StudentHasResponsible" shr
        JOIN "StudentHasLevel" shl
          ON shl."studentId" = shr."studentId"
          AND shl."deletedAt" IS NULL
        JOIN "LevelAssignedToCourseHasAcademicPeriod" lacha
          ON lacha.id = shl."levelAssignedToCourseAcademicPeriodId"
        JOIN "CourseHasAcademicPeriod" chap
          ON chap.id = lacha."courseHasAcademicPeriodId"
        JOIN "AcademicPeriod" ap ON ap.id = chap."academicPeriodId"
        WHERE shr."responsibleId" = :userId
        ORDER BY shl."createdAt" DESC
        LIMIT 1
      `,
      { userId: args.userId }
    )
    if (rows.length > 0) return rows[0].schoolId
    return null
  }

  return null
}
