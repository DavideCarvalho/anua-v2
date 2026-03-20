import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

interface SchoolScope {
  type: 'school'
  schoolIds: string[]
}

interface TeacherScope {
  type: 'teacher'
  classIds: string[]
}

export type PedagogicalScope = SchoolScope | TeacherScope

export async function getPedagogicalScope(ctx: HttpContext): Promise<PedagogicalScope> {
  const user = ctx.effectiveUser ?? ctx.auth.user!
  const roleName = user.role?.name
  const selectedSchoolIds = ctx.selectedSchoolIds ?? []

  if (roleName === 'SCHOOL_TEACHER') {
    const result = await db.rawQuery<{ rows: Array<{ classId: string }> }>(
      `
        SELECT DISTINCT c.id as "classId"
        FROM "TeacherHasClass" thc
        JOIN "Class" c ON c.id = thc."classId"
        WHERE thc."teacherId" = :teacherId
          AND thc."isActive" = true
          AND c."isArchived" = false
          AND (:hasSchoolScope = false OR c."schoolId" = ANY(:schoolIds))
      `,
      {
        teacherId: user.id,
        schoolIds: selectedSchoolIds,
        hasSchoolScope: selectedSchoolIds.length > 0,
      }
    )

    return {
      type: 'teacher',
      classIds: result.rows.map((r) => r.classId),
    }
  }

  return {
    type: 'school',
    schoolIds: selectedSchoolIds,
  }
}

/**
 * Builds SQL filter fragments for scope-aware queries.
 * Returns { whereClause, params } ready to interpolate into raw SQL.
 */
export function buildScopeFilters(scope: PedagogicalScope): {
  schoolFilter: string
  classFilter: string
  params: Record<string, any>
} {
  if (scope.type === 'teacher') {
    if (scope.classIds.length === 0) {
      return { schoolFilter: '', classFilter: 'AND 1=0', params: {} }
    }
    const placeholders = scope.classIds.map((_, i) => `:scopeClassId${i}`).join(', ')
    const params: Record<string, any> = {}
    scope.classIds.forEach((id, i) => {
      params[`scopeClassId${i}`] = id
    })
    return {
      schoolFilter: '',
      classFilter: `AND c.id IN (${placeholders})`,
      params,
    }
  }

  if (scope.schoolIds.length === 0) {
    return { schoolFilter: '', classFilter: '', params: {} }
  }

  return {
    schoolFilter: 'AND s.id = ANY(:scopeSchoolIds)',
    classFilter: '',
    params: { scopeSchoolIds: scope.schoolIds },
  }
}
