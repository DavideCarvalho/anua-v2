import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getByLevelValidator } from '#validators/analytics'

interface LevelRow {
  level_id: string
  level_name: string
  total_enrollments: string
  completed: string
  pending: string
}

export default class GetEnrollmentByLevelController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, academicPeriodId, courseId, levelId, classId } =
      await request.validateUsing(getByLevelValidator)

    let periodFilter = ''
    let courseFilter = ''
    let levelFilter = ''
    let classFilter = ''
    const params: Record<string, string> = {}

    if (schoolId) {
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

    const [byLevelResult] = await Promise.all([
      db.rawQuery(
        `
        SELECT
          l.id as level_id,
          l.name as level_name,
          COUNT(DISTINCT shl.id) as total_enrollments,
          COUNT(DISTINCT CASE WHEN st."enrollmentStatus" = 'REGISTERED' THEN shl.id END) as completed,
          COUNT(DISTINCT CASE WHEN st."enrollmentStatus" = 'PENDING_DOCUMENT_REVIEW' THEN shl.id END) as pending
        FROM "Level" l
        LEFT JOIN "StudentHasLevel" shl ON shl."levelId" = l.id
        LEFT JOIN "Student" st ON shl."studentId" = st.id
        LEFT JOIN "Class" c ON st."classId" = c.id
        WHERE l."schoolId" = :schoolId
        AND l."isActive" = true
        ${periodFilter}
        ${courseFilter}
        ${levelFilter}
        ${classFilter}
        GROUP BY l.id, l.name, l."order"
        ORDER BY l."order", l.name
        `,
        params
      ),
    ])

    const byLevel = (byLevelResult.rows as LevelRow[]).map((row) => ({
      levelId: row.level_id,
      levelName: row.level_name,
      totalEnrollments: Number(row.total_enrollments || 0),
      completed: Number(row.completed || 0),
      pending: Number(row.pending || 0),
    }))

    return response.ok({
      byLevel,
    })
  }
}
