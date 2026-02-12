import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import StudentHasResponsible from '#models/student_has_responsible'
import {
  StudentAssignmentsResponseDto,
  AssignmentDto,
  SubjectFilterDto,
  TeacherDto,
  SubmissionDto,
  AssignmentsSummaryDto,
} from '#models/dto/student_assignments_response.dto'
import AppException from '#exceptions/app_exception'

interface AssignmentRow {
  id: string
  name: string
  description: string | null
  max_score: string | number
  due_date: string
  subject_id: string
  subject_name: string
  teacher_id: string
  teacher_name: string
  submission_id: string | null
  score: string | number | null
  submitted_at: string | null
  computed_status: string
}

interface SubjectRow {
  id: string
  name: string
}

interface SummaryRow {
  total: string | number
  pending: string | number
  completed: string | number
  overdue: string | number
}

export default class GetStudentAssignmentsController {
  async handle({ params, request, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId } = params
    const { status, subjectId } = request.qs()

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para ver as atividades deste aluno')
    }

    // Build the base query
    let statusFilter = ''
    const queryParams: Record<string, string> = { studentId }

    if (status === 'pending') {
      statusFilter = `AND sha.id IS NULL`
    } else if (status === 'completed') {
      statusFilter = `AND sha.id IS NOT NULL AND sha.grade IS NOT NULL`
    } else if (status === 'late') {
      statusFilter = `AND sha.id IS NULL AND a."dueDate" < NOW()`
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
        a.name,
        a.description,
        a.grade as max_score,
        a."dueDate" as due_date,
        s.id as subject_id,
        s.name as subject_name,
        thc."teacherId" as teacher_id,
        u.name as teacher_name,
        sha.id as submission_id,
        sha.grade as score,
        sha."submittedAt" as submitted_at,
        CASE
          WHEN sha.id IS NULL AND a."dueDate" < NOW() THEN 'overdue'
          WHEN sha.id IS NULL THEN 'not_submitted'
          WHEN sha.grade IS NOT NULL THEN 'graded'
          WHEN sha."submittedAt" IS NOT NULL THEN 'submitted'
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
          WHEN sha.id IS NULL THEN a.id
        END) as pending,
        COUNT(DISTINCT CASE
          WHEN sha.id IS NOT NULL AND sha.grade IS NOT NULL THEN a.id
        END) as completed,
        COUNT(DISTINCT CASE
          WHEN sha.id IS NULL AND a."dueDate" < NOW() THEN a.id
        END) as overdue
      FROM "Assignment" a
      JOIN "TeacherHasClass" thc ON a."teacherHasClassId" = thc.id
      JOIN "Class" c ON thc."classId" = c.id
      JOIN "Student" st ON st."classId" = c.id
      LEFT JOIN "StudentHasAssignment" sha ON sha."assignmentId" = a.id AND sha."studentId" = st.id
      WHERE st.id = :studentId
      `,
      { studentId }
    )

    const assignmentsList = (assignments.rows as AssignmentRow[]).map(
      (row) =>
        new AssignmentDto({
          id: row.id,
          title: row.name,
          description: row.description,
          instructions: null,
          maxScore: Number(row.max_score),
          dueDate: row.due_date,
          subject: new SubjectFilterDto({
            id: row.subject_id,
            name: row.subject_name,
          }),
          teacher: new TeacherDto({
            id: row.teacher_id,
            name: row.teacher_name,
          }),
          submission: row.submission_id
            ? new SubmissionDto({
                id: row.submission_id,
                score: row.score ? Number(row.score) : null,
                feedback: null,
                status: row.score ? 'GRADED' : 'SUBMITTED',
                submittedAt: row.submitted_at,
                gradedAt: row.score ? row.submitted_at : null,
              })
            : null,
          computedStatus: row.computed_status,
        })
    )

    const subjectsList = (subjects.rows as SubjectRow[]).map(
      (row) =>
        new SubjectFilterDto({
          id: row.id,
          name: row.name,
        })
    )

    const summaryRow = summary.rows[0] as SummaryRow | undefined
    const summaryData = new AssignmentsSummaryDto({
      total: Number(summaryRow?.total || 0),
      pending: Number(summaryRow?.pending || 0),
      completed: Number(summaryRow?.completed || 0),
      overdue: Number(summaryRow?.overdue || 0),
    })

    return new StudentAssignmentsResponseDto({
      assignments: assignmentsList,
      subjects: subjectsList,
      summary: summaryData,
    })
  }
}
