import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getPedagogicalScope } from '#services/pedagogical_scope'
import { getGradeTrendsValidator } from '#validators/grades'

interface GradeTrendRow {
  period: string
  average_grade: string | number
  graded_count: string | number
}

export default class GetGradeTrendsController {
  async handle({ request, response, ...ctx }: HttpContext) {
    const { academicPeriodId, classId } = await request.validateUsing(getGradeTrendsValidator)
    const scope = await getPedagogicalScope(ctx as HttpContext)

    let joinFilter = ''
    let whereFilter = ''
    const params: Record<string, any> = {}

    if (scope.type === 'teacher') {
      if (scope.classIds.length === 0) {
        return response.ok({ trends: [], overallAverage: 0 })
      }
      const placeholders = scope.classIds.map((_, i) => `:classId${i}`).join(', ')
      scope.classIds.forEach((id, i) => {
        params[`classId${i}`] = id
      })
      joinFilter = `JOIN "Class" c ON st."classId" = c.id AND c.id IN (${placeholders})`
    } else {
      if (scope.schoolIds.length === 0) {
        return response.ok({ trends: [], overallAverage: 0 })
      }
      joinFilter =
        'JOIN "Class" c ON st."classId" = c.id JOIN "School" s ON c."schoolId" = s.id AND s.id = ANY(:schoolIds)'
      params.schoolIds = scope.schoolIds
    }

    if (classId) {
      whereFilter += ' AND c.id = :classId'
      params.classId = classId
    }
    if (academicPeriodId) {
      whereFilter +=
        ' AND EXISTS (SELECT 1 FROM "ClassHasAcademicPeriod" chap WHERE chap."classId" = c.id AND chap."academicPeriodId" = :academicPeriodId)'
      params.academicPeriodId = academicPeriodId
    }

    const result = await db.rawQuery(
      `
      SELECT
        DATE_TRUNC('week', sha."updatedAt") as period,
        AVG(CASE WHEN a.grade > 0 THEN (sha.grade::float / a.grade::float) * 10 ELSE NULL END) as average_grade,
        COUNT(DISTINCT sha.id) as graded_count
      FROM "StudentHasAssignment" sha
      JOIN "Assignment" a ON sha."assignmentId" = a.id
      JOIN "Student" st ON sha."studentId" = st.id
      ${joinFilter}
      WHERE sha.grade IS NOT NULL
      AND sha."updatedAt" >= NOW() - INTERVAL '90 days'
      ${whereFilter}
      GROUP BY DATE_TRUNC('week', sha."updatedAt")
      ORDER BY period ASC
      `,
      params
    )

    const trends = (result.rows as GradeTrendRow[]).map((row) => ({
      period: row.period,
      averageGrade: Math.round(Number(row.average_grade) * 10) / 10,
      gradedCount: Number(row.graded_count),
    }))

    const overallAverage =
      trends.length > 0
        ? Math.round((trends.reduce((sum, t) => sum + t.averageGrade, 0) / trends.length) * 10) / 10
        : 0

    return response.ok({ trends, overallAverage })
  }
}
