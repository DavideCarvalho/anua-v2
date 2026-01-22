import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { EmployeeListDto } from '#dtos/employee_dto'

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
  async handle(ctx: HttpContext) {
    const { request, auth } = ctx
    const user = ctx.effectiveUser ?? auth.user!
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const roles = request.input('roles', [])
    const status = request.input('status', '') // 'active', 'inactive', or '' for all

    // Get schools the user has access to
    const userSchoolsResult = await db.rawQuery<{ rows: UserSchoolRow[] }>(
      `SELECT "schoolId" FROM "UserHasSchool" WHERE "userId" = :userId`,
      { userId: user.id }
    )

    const schoolIds = userSchoolsResult.rows.map((row) => row.schoolId).filter(Boolean)

    if (schoolIds.length === 0) {
      return new EmployeeListDto([], {
        total: 0,
        perPage: limit,
        currentPage: page,
        lastPage: 1,
        firstPage: 1,
      })
    }

    // Roles to exclude - these are not "employees"
    const excludedRoles = ['STUDENT', 'STUDENT_RESPONSIBLE', 'ADMIN', 'SUPER_ADMIN']

    let roleFilter = ''
    const params: Record<string, string | string[] | number | boolean> = {
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

    let statusFilter = ''
    if (status === 'active') {
      statusFilter = 'AND u.active = true'
    } else if (status === 'inactive') {
      statusFilter = 'AND u.active = false'
    }

    // Simple query using only UserHasSchool
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM "User" u
      JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
      JOIN "Role" r ON u."roleId" = r.id
      WHERE uhs."schoolId" = ANY(:schoolIds)
      AND u."deletedAt" IS NULL
      AND r.name != ALL(:excludedRoles)
      ${statusFilter}
      ${roleFilter}
      ${searchFilter}
    `

    const baseQuery = `
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
      AND u."deletedAt" IS NULL
      AND r.name != ALL(:excludedRoles)
      ${statusFilter}
      ${roleFilter}
      ${searchFilter}
      ORDER BY u.name ASC
      LIMIT :limit
      OFFSET :offset
    `

    // Count total
    const countResult = await db.rawQuery<{ rows: CountRow[] }>(countQuery, params)
    const total = Number(countResult.rows[0]?.total || 0)

    // Get employees
    const employeesResult = await db.rawQuery<{ rows: EmployeeRow[] }>(baseQuery, params)

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

    return new EmployeeListDto(employees, {
      total,
      perPage: limit,
      currentPage: page,
      lastPage: Math.ceil(total / limit) || 1,
      firstPage: 1,
    })
  }
}
