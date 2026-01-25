import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getStudentsGradesValidator } from '#validators/grades'

export default class GetStudentsGradesController {
  async handle({ request, response }: HttpContext) {
    const {
      classId,
      subjectId,
      page = 1,
      limit = 20,
    } = await request.validateUsing(getStudentsGradesValidator)

    const offset = (page - 1) * limit

    // Build subject filter
    let subjectFilter = ''
    const params: Record<string, string | number> = { classId, limit, offset }

    if (subjectId) {
      subjectFilter = 'AND a.subject_id = :subjectId'
      params.subjectId = subjectId
    }

    // Get students grades
    const studentsGrades = await db.rawQuery(
      `
      SELECT
        st.id as student_id,
        u.name as student_name,
        u.email as student_email,
        COALESCE(SUM(asub.score), 0) as total_score,
        COALESCE(SUM(a.max_score), 0) as max_possible_score,
        COUNT(DISTINCT a.id) as assignments_count,
        COUNT(DISTINCT CASE WHEN asub.status = 'GRADED' THEN asub.id END) as graded_count,
        CASE
          WHEN SUM(a.max_score) > 0
          THEN ROUND((SUM(asub.score)::numeric / SUM(a.max_score)::numeric) * 100, 2)
          ELSE 0
        END as percentage
      FROM students st
      JOIN users u ON st.id = u.id
      JOIN assignment_submissions asub ON st.id = asub.student_id
      JOIN assignments a ON asub.assignment_id = a.id
      WHERE st.class_id = :classId
      AND st.enrollment_status = 'REGISTERED'
      AND u.deleted_at IS NULL
      ${subjectFilter}
      GROUP BY st.id, u.name, u.email
      ORDER BY percentage DESC
      LIMIT :limit OFFSET :offset
      `,
      params
    )

    // Get total count for pagination
    const countResult = await db.rawQuery(
      `
      SELECT COUNT(DISTINCT st.id) as count
      FROM students st
      JOIN users u ON st.id = u.id
      JOIN assignment_submissions asub ON st.id = asub.student_id
      JOIN assignments a ON asub.assignment_id = a.id
      WHERE st.class_id = :classId
      AND st.enrollment_status = 'REGISTERED'
      AND u.deleted_at IS NULL
      ${subjectFilter}
      `,
      { classId, ...(subjectId && { subjectId }) }
    )

    const total = Number(countResult.rows[0]?.count || 0)

    return response.ok({
      data: studentsGrades.rows.map((row: any) => ({
        student: {
          id: row.student_id,
          name: row.student_name,
          email: row.student_email,
        },
        totalScore: Number(row.total_score),
        maxPossibleScore: Number(row.max_possible_score),
        assignmentsCount: Number(row.assignments_count),
        gradedCount: Number(row.graded_count),
        percentage: Number(row.percentage),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  }
}
