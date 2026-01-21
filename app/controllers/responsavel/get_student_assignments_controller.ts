import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import StudentHasResponsible from '#models/student_has_responsible'

export default class GetStudentAssignmentsController {
  async handle({ params, auth, response, request }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Nao autenticado' })
    }

    const { studentId } = params
    const { status, subjectId } = request.qs()

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', user.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      return response.forbidden({
        message: 'Voce nao tem permissao para ver as atividades deste aluno',
      })
    }

    // Build the base query
    let statusFilter = ''
    const queryParams: Record<string, any> = { studentId }

    if (status === 'pending') {
      statusFilter = `AND (sha.id IS NULL OR sha.status IN ('NOT_SUBMITTED', 'SUBMITTED'))`
    } else if (status === 'completed') {
      statusFilter = `AND sha.status = 'GRADED'`
    } else if (status === 'late') {
      statusFilter = `AND sha.status = 'LATE'`
    }

    let subjectFilter = ''
    if (subjectId) {
      subjectFilter = `AND thc."subjectId" = :subjectId`
      queryParams.subjectId = subjectId
    }

    // Get assignments for the student's class
    const assignments = await db.rawQuery(
      `
      SELECT
        a.id,
        a.title,
        a.description,
        a.instructions,
        a.grade as max_score,
        a."dueDate" as due_date,
        a.status as assignment_status,
        s.id as subject_id,
        s.name as subject_name,
        thc."teacherId" as teacher_id,
        u.name as teacher_name,
        sha.id as submission_id,
        sha.grade as score,
        sha.feedback,
        sha.status as submission_status,
        sha."submittedAt" as submitted_at,
        sha."gradedAt" as graded_at,
        CASE
          WHEN sha.id IS NULL AND a."dueDate" < NOW() THEN 'overdue'
          WHEN sha.id IS NULL THEN 'not_submitted'
          WHEN sha.status = 'GRADED' THEN 'graded'
          WHEN sha.status = 'SUBMITTED' THEN 'submitted'
          WHEN sha.status = 'LATE' THEN 'late'
          ELSE 'not_submitted'
        END as computed_status
      FROM "Assignment" a
      JOIN "TeacherHasClass" thc ON a."teacherHasClassId" = thc.id
      JOIN "Class" c ON thc."classId" = c.id
      JOIN "Subject" s ON thc."subjectId" = s.id
      JOIN "User" u ON thc."teacherId" = u.id
      JOIN "Student" st ON st."classId" = c.id
      LEFT JOIN "StudentHasAssignment" sha ON sha."assignmentId" = a.id AND sha."studentId" = st.id
      WHERE st.id = :studentId
        AND a.status = 'PUBLISHED'
        ${statusFilter}
        ${subjectFilter}
      ORDER BY a."dueDate" DESC
      `,
      queryParams
    )

    // Get subjects for filtering
    const subjects = await db.rawQuery(
      `
      SELECT DISTINCT s.id, s.name
      FROM "Assignment" a
      JOIN "TeacherHasClass" thc ON a."teacherHasClassId" = thc.id
      JOIN "Class" c ON thc."classId" = c.id
      JOIN "Subject" s ON thc."subjectId" = s.id
      JOIN "Student" st ON st."classId" = c.id
      WHERE st.id = :studentId
        AND a.status = 'PUBLISHED'
      ORDER BY s.name
      `,
      { studentId }
    )

    // Get summary stats
    const summary = await db.rawQuery(
      `
      SELECT
        COUNT(DISTINCT a.id) as total,
        COUNT(DISTINCT CASE
          WHEN sha.id IS NULL OR sha.status IN ('NOT_SUBMITTED', 'SUBMITTED') THEN a.id
        END) as pending,
        COUNT(DISTINCT CASE
          WHEN sha.status = 'GRADED' THEN a.id
        END) as completed,
        COUNT(DISTINCT CASE
          WHEN (sha.id IS NULL AND a."dueDate" < NOW()) OR sha.status = 'LATE' THEN a.id
        END) as overdue
      FROM "Assignment" a
      JOIN "TeacherHasClass" thc ON a."teacherHasClassId" = thc.id
      JOIN "Class" c ON thc."classId" = c.id
      JOIN "Student" st ON st."classId" = c.id
      LEFT JOIN "StudentHasAssignment" sha ON sha."assignmentId" = a.id AND sha."studentId" = st.id
      WHERE st.id = :studentId
        AND a.status = 'PUBLISHED'
      `,
      { studentId }
    )

    return response.ok({
      assignments: assignments.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        instructions: row.instructions,
        maxScore: Number(row.max_score),
        dueDate: row.due_date,
        subject: {
          id: row.subject_id,
          name: row.subject_name,
        },
        teacher: {
          id: row.teacher_id,
          name: row.teacher_name,
        },
        submission: row.submission_id
          ? {
              id: row.submission_id,
              score: row.score ? Number(row.score) : null,
              feedback: row.feedback,
              status: row.submission_status,
              submittedAt: row.submitted_at,
              gradedAt: row.graded_at,
            }
          : null,
        computedStatus: row.computed_status,
      })),
      subjects: subjects.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
      })),
      summary: {
        total: Number(summary.rows[0]?.total || 0),
        pending: Number(summary.rows[0]?.pending || 0),
        completed: Number(summary.rows[0]?.completed || 0),
        overdue: Number(summary.rows[0]?.overdue || 0),
      },
    })
  }
}
