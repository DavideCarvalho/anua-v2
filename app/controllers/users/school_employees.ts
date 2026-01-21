import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

interface UserSchoolRow {
  schoolId: string
}

interface CountRow {
  total: string
}

interface EmployeeRow {
  id: string
  name: string
  email: string | null
  active: boolean
  createdAt: string
  roleId: string
  roleName: string
}

export default class SchoolEmployeesController {
  async handle({ request, response, auth }: HttpContext) {
    const user = auth.user!
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const roles = request.input('roles', [])

    // Get schools the user has access to
    const userSchoolsResult = await db.rawQuery<{ rows: UserSchoolRow[] }>(
      `
      SELECT "schoolId" FROM "UserHasSchool" WHERE "userId" = :userId
      `,
      { userId: user.id }
    )

    const schoolIds = userSchoolsResult.rows.map((row) => row.schoolId).filter(Boolean)

    if (schoolIds.length === 0) {
      return response.ok({
        data: [],
        meta: {
          total: 0,
          perPage: limit,
          currentPage: page,
          lastPage: 1,
          firstPage: 1,
        },
      })
    }

    // Roles to exclude - these are not "employees"
    const excludedRoles = ['STUDENT', 'STUDENT_RESPONSIBLE', 'ADMIN', 'SUPER_ADMIN']

    let roleFilter = ''
    const params: Record<string, string | string[] | number> = {
      schoolIds,
      excludedRoles,
      limit,
      offset: (page - 1) * limit,
    }

    if (roles && roles.length > 0) {
      roleFilter = 'AND r.name = ANY(:roles)'
      params.roles = roles
    }

    let searchFilter = ''
    if (search) {
      searchFilter = 'AND (u.name ILIKE :search OR u.email ILIKE :search)'
      params.search = `%${search}%`
    }

    // Count total
    const countResult = await db.rawQuery<{ rows: CountRow[] }>(
      `
      SELECT COUNT(DISTINCT u.id) as total
      FROM "User" u
      JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
      JOIN "Role" r ON u."roleId" = r.id
      WHERE uhs."schoolId" = ANY(:schoolIds)
      AND u.active = true
      AND u."deletedAt" IS NULL
      AND r.name != ALL(:excludedRoles)
      ${roleFilter}
      ${searchFilter}
      `,
      params
    )

    const total = Number(countResult.rows[0]?.total || 0)

    // Get employees
    const employeesResult = await db.rawQuery<{ rows: EmployeeRow[] }>(
      `
      SELECT DISTINCT
        u.id,
        u.name,
        u.email,
        u.active,
        u."createdAt",
        r.id as "roleId",
        r.name as "roleName"
      FROM "User" u
      JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
      JOIN "Role" r ON u."roleId" = r.id
      WHERE uhs."schoolId" = ANY(:schoolIds)
      AND u.active = true
      AND u."deletedAt" IS NULL
      AND r.name != ALL(:excludedRoles)
      ${roleFilter}
      ${searchFilter}
      ORDER BY u.name ASC
      LIMIT :limit
      OFFSET :offset
      `,
      params
    )

    const employees = employeesResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      active: row.active,
      createdAt: row.createdAt,
      role: {
        id: row.roleId,
        name: row.roleName,
      },
    }))

    return response.ok({
      data: employees,
      meta: {
        total,
        perPage: limit,
        currentPage: page,
        lastPage: Math.ceil(total / limit) || 1,
        firstPage: 1,
      },
    })
  }
}
