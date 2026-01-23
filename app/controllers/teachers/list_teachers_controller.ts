import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { TeacherListDto } from '#dtos/teacher_dto'

interface UserSchoolRow {
  schoolId: string
}

interface CountRow {
  total: string
}

interface TeacherRow {
  id: string
  hourlyRate: number | null
  userId: string
  userName: string
  userEmail: string | null
  userActive: boolean
}

interface SubjectRow {
  teacherId: string
  subjectId: string
  subjectName: string
}

export default class ListTeachersController {
  async handle(ctx: HttpContext) {
    const { request, auth } = ctx
    const user = ctx.effectiveUser ?? auth.user!
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const active = request.input('active')

    // Get schools the user has access to
    const userSchoolsResult = await db.rawQuery<{ rows: UserSchoolRow[] }>(
      `SELECT "schoolId" FROM "UserHasSchool" WHERE "userId" = :userId`,
      { userId: user.id }
    )

    const schoolIds = userSchoolsResult.rows.map((row) => row.schoolId).filter(Boolean)

    if (schoolIds.length === 0) {
      return new TeacherListDto([], {
        total: 0,
        perPage: limit,
        currentPage: page,
        lastPage: 1,
        firstPage: 1,
      })
    }

    const params: Record<string, string | string[] | number | boolean> = {
      schoolIds,
      limit,
      offset: (page - 1) * limit,
    }

    let searchFilter = ''
    if (search) {
      searchFilter = 'AND u.name ILIKE :search'
      params.search = `%${search}%`
    }

    let activeFilter = ''
    if (active !== undefined && active !== null && active !== '') {
      activeFilter = 'AND u.active = :active'
      params.active = active === 'true' || active === true
    }

    // Count total
    const countQuery = `
      SELECT COUNT(DISTINCT t.id) as total
      FROM "Teacher" t
      JOIN "User" u ON t.id = u.id
      JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
      WHERE uhs."schoolId" = ANY(:schoolIds)
      AND u."deletedAt" IS NULL
      ${searchFilter}
      ${activeFilter}
    `

    const countResult = await db.rawQuery<{ rows: CountRow[] }>(countQuery, params)
    const total = Number(countResult.rows[0]?.total || 0)

    // Get teachers
    const teachersQuery = `
      SELECT DISTINCT
        t.id,
        t."hourlyRate",
        u.id as "userId",
        u.name as "userName",
        u.email as "userEmail",
        u.active as "userActive"
      FROM "Teacher" t
      JOIN "User" u ON t.id = u.id
      JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
      WHERE uhs."schoolId" = ANY(:schoolIds)
      AND u."deletedAt" IS NULL
      ${searchFilter}
      ${activeFilter}
      ORDER BY u.name ASC
      LIMIT :limit
      OFFSET :offset
    `

    const teachersResult = await db.rawQuery<{ rows: TeacherRow[] }>(teachersQuery, params)
    const teacherIds = teachersResult.rows.map((t) => t.id)

    // Get subjects for all teachers
    let subjectsByTeacher: Record<string, Array<{ id: string; name: string }>> = {}
    if (teacherIds.length > 0) {
      const subjectsQuery = `
        SELECT
          ths."teacherId",
          s.id as "subjectId",
          s.name as "subjectName"
        FROM "TeacherHasSubject" ths
        JOIN "Subject" s ON ths."subjectId" = s.id
        WHERE ths."teacherId" = ANY(:teacherIds)
      `
      const subjectsResult = await db.rawQuery<{ rows: SubjectRow[] }>(subjectsQuery, {
        teacherIds,
      })

      subjectsByTeacher = subjectsResult.rows.reduce(
        (acc, row) => {
          if (!acc[row.teacherId]) {
            acc[row.teacherId] = []
          }
          acc[row.teacherId].push({ id: row.subjectId, name: row.subjectName })
          return acc
        },
        {} as Record<string, Array<{ id: string; name: string }>>
      )
    }

    const teachers = teachersResult.rows.map((row) => ({
      id: row.id,
      hourlyRate: row.hourlyRate,
      user: {
        id: row.userId,
        name: row.userName,
        email: row.userEmail,
        active: row.userActive,
      },
      subjects: subjectsByTeacher[row.id] || [],
    }))

    return new TeacherListDto(teachers, {
      total,
      perPage: limit,
      currentPage: page,
      lastPage: Math.ceil(total / limit) || 1,
      firstPage: 1,
    })
  }
}
