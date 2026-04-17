import AcademicSubPeriod from '#models/academic_sub_period'
import Exam from '#models/exam'
import Assignment from '#models/assignment'
import ExamGrade from '#models/exam_grade'
import type School from '#models/school'
import db from '@adonisjs/lucid/services/db'

export type SubPeriodGrade = {
  subPeriodId: string
  subPeriodName: string
  order: number
  grade: number | null
  recoveryGrade: number | null
  finalGrade: number | null
  weight: number
  minimumGrade: number
  hasRecovery: boolean
  status: 'APPROVED' | 'IN_RECOVERY' | 'RECOVERED' | 'FAILED' | 'NO_GRADE'
}

export type PeriodGradeResult = {
  subPeriodGrades: SubPeriodGrade[]
  finalGrade: number | null
  isApproved: boolean | null
}

export class SubPeriodGradeCalculator {
  static async calculateForStudent(
    school: School,
    academicPeriodId: string,
    studentId: string,
    subjectId: string,
    classId: string,
    calculationAlgorithm: string
  ): Promise<PeriodGradeResult | null> {
    if (!school.periodStructure) return null

    const subPeriods = await AcademicSubPeriod.query()
      .where('academicPeriodId', academicPeriodId)
      .whereNull('deletedAt')
      .orderBy('order', 'asc')

    if (subPeriods.length === 0) return null

    const assignments = await Assignment.query()
      .whereHas('teacherHasClass', (q) => {
        q.where('classId', classId).where('subjectId', subjectId)
      })
      .orderBy('dueDate', 'asc')

    const exams = await Exam.query()
      .where('classId', classId)
      .where('subjectId', subjectId)
      .orderBy('examDate', 'asc')

    const assignmentIds = assignments.map((a) => a.id)
    const studentAssignments =
      assignmentIds.length > 0
        ? await db
            .from('StudentHasAssignment')
            .whereIn('assignmentId', assignmentIds)
            .where('studentId', studentId)
            .select('assignmentId', 'grade', 'recoveryGrade')
        : []

    const examIds = exams.map((e) => e.id)
    const studentExamGrades =
      examIds.length > 0
        ? await ExamGrade.query()
            .whereIn('examId', examIds)
            .where('studentId', studentId)
            .select('examId', 'score', 'attended', 'recoveryGrade')
        : []

    const assignmentGradeMap = new Map(studentAssignments.map((sa) => [sa.assignmentId, sa]))
    const examGradeMap = new Map(studentExamGrades.map((eg) => [eg.examId, eg]))

    const subPeriodGrades: SubPeriodGrade[] = []
    const recoveryMethod = school.recoveryGradeMethod || 'AVERAGE'

    for (const subPeriod of subPeriods) {
      const subPeriodAssignments = assignments.filter((a) => a.subPeriodId === subPeriod.id)
      const subPeriodExams = exams.filter((e) => e.subPeriodId === subPeriod.id)

      const grade = this.calculateGrade(
        subPeriodAssignments,
        subPeriodExams,
        assignmentGradeMap,
        examGradeMap,
        calculationAlgorithm
      )

      const recoveryGrade = this.calculateRecoveryGrade(
        subPeriodAssignments,
        subPeriodExams,
        assignmentGradeMap,
        examGradeMap
      )

      const finalGrade = this.applyRecovery(grade, recoveryGrade, recoveryMethod)

      const effectiveMinimumGrade = subPeriod.minimumGrade ?? school.minimumGrade ?? 6

      let status: SubPeriodGrade['status'] = 'NO_GRADE'
      if (grade !== null) {
        if (finalGrade !== null && finalGrade >= effectiveMinimumGrade) {
          status =
            grade < effectiveMinimumGrade && recoveryGrade !== null ? 'RECOVERED' : 'APPROVED'
        } else if (subPeriod.hasRecovery && recoveryGrade === null) {
          status = 'IN_RECOVERY'
        } else {
          status = 'FAILED'
        }
      }

      subPeriodGrades.push({
        subPeriodId: subPeriod.id,
        subPeriodName: subPeriod.name,
        order: subPeriod.order,
        grade: grade !== null ? Number.parseFloat(grade.toFixed(1)) : null,
        recoveryGrade: recoveryGrade !== null ? Number.parseFloat(recoveryGrade.toFixed(1)) : null,
        finalGrade: finalGrade !== null ? Number.parseFloat(finalGrade.toFixed(1)) : null,
        weight: subPeriod.weight,
        minimumGrade: effectiveMinimumGrade,
        hasRecovery: subPeriod.hasRecovery,
        status,
      })
    }

    const finalGrade = this.calculateFinalGrade(subPeriodGrades)
    const minimumGrade = school.minimumGrade ?? 6
    const isApproved = finalGrade !== null ? finalGrade >= minimumGrade : null

    return { subPeriodGrades, finalGrade, isApproved }
  }

  private static calculateGrade(
    assignments: Assignment[],
    exams: Exam[],
    assignmentGradeMap: Map<string, any>,
    examGradeMap: Map<string, any>,
    calculationAlgorithm: string
  ): number | null {
    const gradableAssignments = assignments.filter((a) => (a.grade ?? 0) > 0)
    const gradableAssignmentIds = new Set(gradableAssignments.map((a) => a.id))
    const gradableExams = exams.filter((e) => e.maxScore > 0)
    const gradableExamIds = new Set(gradableExams.map((e) => e.id))

    const gradedAssignments = [...gradableAssignmentIds].filter((id) => {
      const sa = assignmentGradeMap.get(id)
      return sa && sa.grade !== null
    })

    const gradedExams = [...gradableExamIds].filter((id) => {
      const eg = examGradeMap.get(id)
      return eg && eg.score !== null && eg.attended
    })

    const totalGradedItems = gradedAssignments.length + gradedExams.length
    if (totalGradedItems === 0) return null

    const assignmentSum = gradedAssignments.reduce((sum, id) => {
      const sa = assignmentGradeMap.get(id)
      return sum + (sa?.grade ?? 0)
    }, 0)

    const examSum = gradedExams.reduce((sum, id) => {
      const eg = examGradeMap.get(id)
      return sum + (eg?.score ?? 0)
    }, 0)

    if (calculationAlgorithm === 'SUM') {
      return assignmentSum + examSum
    }

    return (assignmentSum + examSum) / totalGradedItems
  }

  private static calculateRecoveryGrade(
    assignments: Assignment[],
    exams: Exam[],
    assignmentGradeMap: Map<string, any>,
    examGradeMap: Map<string, any>
  ): number | null {
    const recoveryGrades: number[] = []

    for (const assignment of assignments) {
      const sa = assignmentGradeMap.get(assignment.id)
      if (sa && sa.recoveryGrade !== null && sa.recoveryGrade !== undefined) {
        recoveryGrades.push(sa.recoveryGrade)
      }
    }

    for (const exam of exams) {
      const eg = examGradeMap.get(exam.id)
      if (eg && eg.recoveryGrade !== null && eg.recoveryGrade !== undefined) {
        recoveryGrades.push(eg.recoveryGrade)
      }
    }

    if (recoveryGrades.length === 0) return null

    return recoveryGrades.reduce((sum, g) => sum + g, 0) / recoveryGrades.length
  }

  private static applyRecovery(
    originalGrade: number | null,
    recoveryGrade: number | null,
    method: string
  ): number | null {
    if (originalGrade === null) return null
    if (recoveryGrade === null) return originalGrade

    switch (method) {
      case 'AVERAGE':
        return (originalGrade + recoveryGrade) / 2
      case 'REPLACE_IF_HIGHER':
        return Math.max(originalGrade, recoveryGrade)
      case 'REPLACE':
        return recoveryGrade
      default:
        return originalGrade
    }
  }

  private static calculateFinalGrade(subPeriodGrades: SubPeriodGrade[]): number | null {
    const gradedPeriods = subPeriodGrades.filter((sp) => sp.finalGrade !== null)
    if (gradedPeriods.length === 0) return null

    const totalWeight = gradedPeriods.reduce((sum, sp) => sum + sp.weight, 0)
    if (totalWeight === 0) return null

    const weightedSum = gradedPeriods.reduce((sum, sp) => sum + sp.finalGrade! * sp.weight, 0)
    return weightedSum / totalWeight
  }
}
