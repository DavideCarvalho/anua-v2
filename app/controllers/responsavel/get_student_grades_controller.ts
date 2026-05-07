import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import StudentHasResponsible from '#models/student_has_responsible'
import School from '#models/school'
import Class_ from '#models/class'
import { SubPeriodGradeCalculator } from '#services/sub_period_grade_calculator'
import { getStudentGradesValidator } from '#validators/responsavel'
import { DateTime } from 'luxon'
import AppException from '#exceptions/app_exception'

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
  async handle({ params, request, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId } = params
    const { academicPeriodId } = await request.validateUsing(getStudentGradesValidator)

    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para ver as notas deste aluno')
    }

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

    let subPeriodGradesMap: Record<string, unknown[]> = {}

    if (academicPeriodId) {
      const student = await relation.related('student').query().first()
      if (student?.classId) {
        const classEntity = await Class_.query().where('id', student.classId).first()
        if (classEntity) {
          const school = await School.find(classEntity.schoolId)
          if (school?.periodStructure) {
            const calculationAlgorithm = school.calculationAlgorithm ?? 'AVERAGE'

            for (const row of grades.rows as SubjectGradeRow[]) {
              const result = await SubPeriodGradeCalculator.calculateForStudent(
                school,
                academicPeriodId,
                studentId,
                row.subject_id,
                student.classId,
                calculationAlgorithm
              )
              if (result) {
                subPeriodGradesMap[row.subject_id] = result.subPeriodGrades
              }
            }
          }
        }
      }
    }

    const bySubject = (grades.rows as SubjectGradeRow[]).map((row) => ({
      subjectId: row.subject_id,
      subjectName: row.subject_name,
      totalScore: Number(row.total_score),
      maxPossibleScore: Number(row.max_possible_score),
      assignmentsCount: Number(row.assignments_count),
      gradedCount: Number(row.graded_count),
      pendingCount: Number(row.pending_count),
      average: Number(row.average),
      ...(subPeriodGradesMap[row.subject_id]
        ? { subPeriodGrades: subPeriodGradesMap[row.subject_id] }
        : {}),
    }))

    const recentAssignmentsList = (recentAssignments.rows as RecentAssignmentRow[]).map((row) => ({
      assignmentId: row.assignment_id,
      title: row.assignment_title,
      subjectName: row.subject_name,
      maxScore: Number(row.max_score),
      score: row.score ? Number(row.score) : null,
      status: row.status,
      dueDate: parseDate(row.due_date)?.toJSDate() ?? null,
      submittedAt: parseDate(row.submitted_at)?.toJSDate() ?? null,
      gradedAt: parseDate(row.graded_at)?.toJSDate() ?? null,
    }))

    const summaryRow = overallResult.rows[0] as OverallSummaryRow | undefined
    const summary = {
      overallAverage: summaryRow ? Number(summaryRow.overall_average) : 0,
      totalScore: summaryRow ? Number(summaryRow.total_score) : 0,
      maxPossibleScore: summaryRow ? Number(summaryRow.max_possible_score) : 0,
    }

    return {
      bySubject,
      recentAssignments: recentAssignmentsList,
      summary,
    }
  }
}
