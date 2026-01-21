import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import StudentHasResponsible from '#models/student_has_responsible'

export default class GetStudentGradesController {
  async handle({ params, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Nao autenticado' })
    }

    const { studentId } = params

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', user.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      return response.forbidden({ message: 'Voce nao tem permissao para ver as notas deste aluno' })
    }

    // Get student's grades grouped by subject
    const grades = await db.rawQuery(
      `
      SELECT
        s.id as subject_id,
        s.name as subject_name,
        COALESCE(SUM(sha.grade), 0) as total_score,
        COALESCE(SUM(a.grade), 0) as max_possible_score,
        COUNT(DISTINCT a.id) as assignments_count,
        COUNT(DISTINCT CASE WHEN sha.status = 'GRADED' THEN sha.id END) as graded_count,
        COUNT(DISTINCT CASE WHEN sha.status = 'PENDING' THEN sha.id END) as pending_count,
        CASE
          WHEN SUM(a.grade) > 0
          THEN ROUND((SUM(sha.grade)::numeric / SUM(a.grade)::numeric) * 10, 2)
          ELSE 0
        END as average
      FROM "StudentHasAssignment" sha
      JOIN "Assignment" a ON sha."assignmentId" = a.id
      JOIN "TeacherHasClass" thc ON a."teacherHasClassId" = thc.id
      JOIN "Subject" s ON thc."subjectId" = s.id
      WHERE sha."studentId" = :studentId
      GROUP BY s.id, s.name
      ORDER BY s.name
      `,
      { studentId }
    )

    // Get recent assignments with grades
    const recentAssignments = await db.rawQuery(
      `
      SELECT
        a.id as assignment_id,
        a.title as assignment_title,
        a.grade as max_score,
        a."dueDate" as due_date,
        s.name as subject_name,
        sha.grade as score,
        sha.status,
        sha."submittedAt" as submitted_at,
        sha."gradedAt" as graded_at
      FROM "StudentHasAssignment" sha
      JOIN "Assignment" a ON sha."assignmentId" = a.id
      JOIN "TeacherHasClass" thc ON a."teacherHasClassId" = thc.id
      JOIN "Subject" s ON thc."subjectId" = s.id
      WHERE sha."studentId" = :studentId
      ORDER BY sha."submittedAt" DESC
      LIMIT 10
      `,
      { studentId }
    )

    // Calculate overall average
    const overallResult = await db.rawQuery(
      `
      SELECT
        COALESCE(SUM(sha.grade), 0) as total_score,
        COALESCE(SUM(a.grade), 0) as max_possible_score,
        CASE
          WHEN SUM(a.grade) > 0
          THEN ROUND((SUM(sha.grade)::numeric / SUM(a.grade)::numeric) * 10, 2)
          ELSE 0
        END as overall_average
      FROM "StudentHasAssignment" sha
      JOIN "Assignment" a ON sha."assignmentId" = a.id
      WHERE sha."studentId" = :studentId
      AND sha.status = 'GRADED'
      `,
      { studentId }
    )

    return response.ok({
      bySubject: grades.rows.map((row: any) => ({
        subjectId: row.subject_id,
        subjectName: row.subject_name,
        totalScore: Number(row.total_score),
        maxPossibleScore: Number(row.max_possible_score),
        assignmentsCount: Number(row.assignments_count),
        gradedCount: Number(row.graded_count),
        pendingCount: Number(row.pending_count),
        average: Number(row.average),
      })),
      recentAssignments: recentAssignments.rows.map((row: any) => ({
        assignmentId: row.assignment_id,
        title: row.assignment_title,
        subjectName: row.subject_name,
        maxScore: Number(row.max_score),
        score: row.score ? Number(row.score) : null,
        status: row.status,
        dueDate: row.due_date,
        submittedAt: row.submitted_at,
        gradedAt: row.graded_at,
      })),
      summary: {
        overallAverage: Number(overallResult.rows[0]?.overall_average || 0),
        totalScore: Number(overallResult.rows[0]?.total_score || 0),
        maxPossibleScore: Number(overallResult.rows[0]?.max_possible_score || 0),
      },
    })
  }
}
