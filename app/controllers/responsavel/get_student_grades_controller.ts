import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import StudentHasResponsible from '#models/student_has_responsible'
import {
  StudentGradesResponseDto,
  SubjectGradeDto,
  RecentAssignmentDto,
  GradesSummaryDto,
} from '#models/dto/student_grades_response.dto'
import { DateTime } from 'luxon'

interface SubjectGradeRow {
  subject_id: string
  subject_name: string
  total_score: string | number
  max_possible_score: string | number
  assignments_count: string | number
  graded_count: string | number
  pending_count: string | number
  average: string | number
}

interface RecentAssignmentRow {
  assignment_id: string
  assignment_title: string
  max_score: string | number
  due_date: string | Date | DateTime | null
  subject_name: string
  score: string | number | null
  status: string
  submitted_at: string | Date | DateTime | null
  graded_at: string | Date | DateTime | null
}

interface OverallSummaryRow {
  total_score: string | number
  max_possible_score: string | number
  overall_average: string | number
}

type DateValue = string | Date | DateTime | null

export default class GetStudentGradesController {
  async handle({ params, response, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      return response.unauthorized({ message: 'Nao autenticado' })
    }

    const { studentId } = params

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
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
        COUNT(DISTINCT CASE WHEN sha.grade IS NOT NULL THEN sha.id END) as graded_count,
        COUNT(DISTINCT CASE WHEN sha.grade IS NULL THEN sha.id END) as pending_count,
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
        a.name as assignment_title,
        a.grade as max_score,
        a."dueDate" as due_date,
        s.name as subject_name,
        sha.grade as score,
        CASE WHEN sha.grade IS NOT NULL THEN 'GRADED' ELSE 'PENDING' END as status,
        sha."submittedAt" as submitted_at,
        sha."updatedAt" as graded_at
      FROM "StudentHasAssignment" sha
      JOIN "Assignment" a ON sha."assignmentId" = a.id
      JOIN "TeacherHasClass" thc ON a."teacherHasClassId" = thc.id
      JOIN "Subject" s ON thc."subjectId" = s.id
      WHERE sha."studentId" = :studentId
      ORDER BY sha."updatedAt" DESC
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
      AND sha.grade IS NOT NULL
      `,
      { studentId }
    )

    const parseDate = (dateValue: DateValue): DateTime | null => {
      if (!dateValue) return null
      if (dateValue instanceof DateTime) return dateValue
      if (dateValue instanceof Date) return DateTime.fromJSDate(dateValue)
      return DateTime.fromISO(String(dateValue))
    }

    const bySubject = (grades.rows as SubjectGradeRow[]).map(
      (row) =>
        new SubjectGradeDto({
          subjectId: row.subject_id,
          subjectName: row.subject_name,
          totalScore: Number(row.total_score),
          maxPossibleScore: Number(row.max_possible_score),
          assignmentsCount: Number(row.assignments_count),
          gradedCount: Number(row.graded_count),
          pendingCount: Number(row.pending_count),
          average: Number(row.average),
        })
    )

    const recentAssignmentsList = (recentAssignments.rows as RecentAssignmentRow[]).map(
      (row) =>
        new RecentAssignmentDto({
          assignmentId: row.assignment_id,
          title: row.assignment_title,
          subjectName: row.subject_name,
          maxScore: Number(row.max_score),
          score: row.score ? Number(row.score) : null,
          status: row.status,
          dueDate: parseDate(row.due_date),
          submittedAt: parseDate(row.submitted_at),
          gradedAt: parseDate(row.graded_at),
        })
    )

    const summaryRow = overallResult.rows[0] as OverallSummaryRow | undefined
    const summary = new GradesSummaryDto({
      overallAverage: summaryRow ? Number(summaryRow.overall_average) : 0,
      totalScore: summaryRow ? Number(summaryRow.total_score) : 0,
      maxPossibleScore: summaryRow ? Number(summaryRow.max_possible_score) : 0,
    })

    return new StudentGradesResponseDto({
      bySubject,
      recentAssignments: recentAssignmentsList,
      summary,
    })
  }
}
