import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getTrendsValidator } from '#validators/analytics'

interface EnrollmentTrendRow {
  date: string
  enrollments: string
}

export default class GetEnrollmentTrendsController {
  async handle({ request, response }: HttpContext) {
    const {
      schoolId,
      academicPeriodId,
      courseId,
      levelId,
      classId,
      days = 30,
    } = await request.validateUsing(getTrendsValidator)

    let schoolFilter = ''
    let periodFilter = ''
    let courseFilter = ''
    let levelFilter = ''
    let classFilter = ''
    const params: Record<string, string | number> = { days }

    if (schoolId) {
      schoolFilter = 'AND s.id = :schoolId'
      params.schoolId = schoolId
    }

    if (academicPeriodId) {
      periodFilter = 'AND shl."academicPeriodId" = :academicPeriodId'
      params.academicPeriodId = academicPeriodId
    }

    if (courseId) {
      courseFilter = 'AND c."courseId" = :courseId'
      params.courseId = courseId
    }

    if (levelId) {
      levelFilter = 'AND shl."levelId" = :levelId'
      params.levelId = levelId
    }

    if (classId) {
      classFilter = 'AND st."classId" = :classId'
      params.classId = classId
    }

    const [trendsResult] = await Promise.all([
      db.rawQuery(
        `
        WITH date_series AS (
          SELECT generate_series(
            CURRENT_DATE - INTERVAL '1 day' * :days,
            CURRENT_DATE,
            '1 day'::interval
          )::date as date
        )
        SELECT
          ds.date,
          COUNT(shl.id) as enrollments
        FROM date_series ds
        LEFT JOIN "StudentHasLevel" shl ON DATE(shl."createdAt") = ds.date
        LEFT JOIN "Student" st ON shl."studentId" = st.id
        LEFT JOIN "Class" c ON st."classId" = c.id
        LEFT JOIN "User" u ON st.id = u.id
        LEFT JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        LEFT JOIN "School" s ON uhs."schoolId" = s.id
        WHERE (u."deletedAt" IS NULL OR shl.id IS NULL)
        ${schoolFilter}
        ${periodFilter}
        ${courseFilter}
        ${levelFilter}
        ${classFilter}
        GROUP BY ds.date
        ORDER BY ds.date ASC
        `,
        params
      ),
    ])

    const trends = (trendsResult.rows as EnrollmentTrendRow[]).map((row) => ({
      date: row.date,
      enrollments: Number(row.enrollments || 0),
    }))

    // Calculate total and average
    const total = trends.reduce((sum, t) => sum + t.enrollments, 0)
    const average = trends.length > 0 ? Math.round((total / trends.length) * 10) / 10 : 0

    return response.ok({
      trends,
      total,
      average,
      period: days,
    })
  }
}
