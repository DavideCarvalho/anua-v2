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
  async handle({ request, response, selectedSchoolIds }: HttpContext) {
    const { schoolId, academicPeriodId, courseId, levelId, classId } =
      await request.validateUsing(getByLevelValidator)

    const effectiveSchoolId = schoolId ?? selectedSchoolIds?.[0]
    if (!effectiveSchoolId) {
      return response.ok({ byLevel: [] })
    }

    let periodFilter = ''
    let courseFilter = ''
    let levelFilter = ''
    let classFilter = ''
    const params: Record<string, string> = { schoolId: effectiveSchoolId }

    if (academicPeriodId) {
      periodFilter = 'AND shl."academicPeriodId" = :academicPeriodId'
      params.academicPeriodId = academicPeriodId
    }

    if (courseId) {
      courseFilter = `AND EXISTS (
        SELECT 1 FROM "LevelAssignedToCourseHasAcademicPeriod" latcap
        JOIN "CourseHasAcademicPeriod" chap ON chap.id = latcap."courseHasAcademicPeriodId"
        WHERE latcap."levelId" = l.id
        AND latcap."isActive" = true
        AND chap."courseId" = :courseId
      )`
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
        INNER JOIN "StudentHasLevel" shl ON shl."levelId" = l.id
        INNER JOIN "AcademicPeriod" ap ON ap.id = shl."academicPeriodId"
        INNER JOIN "Student" st ON shl."studentId" = st.id
        INNER JOIN "User" u ON u.id = st.id
        WHERE l."schoolId" = :schoolId
        AND l."isActive" = true
        AND ap."isActive" = true
        AND u."deletedAt" IS NULL
        ${periodFilter}
        ${courseFilter}
        ${levelFilter}
        ${classFilter}
        GROUP BY l.id, l.name, l."order"
        HAVING COUNT(DISTINCT shl.id) > 0
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
