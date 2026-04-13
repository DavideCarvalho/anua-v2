import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Class_ from '#models/class'
import School from '#models/school'
import AcademicPeriod from '#models/academic_period'
import Assignment from '#models/assignment'
import Attendance from '#models/attendance'
import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'
import { getStudents } from '#services/class_students_service'
import { SubPeriodGradeCalculator } from '#services/sub_period_grade_calculator'
import AppException from '#exceptions/app_exception'
import { getStudentStatusValidator } from '#validators/student_status'

type StudentStatus = 'APPROVED' | 'AT_RISK_GRADE' | 'AT_RISK_ATTENDANCE' | 'FAILED' | 'IN_PROGRESS'

interface StudentStatusResult {
  id: string
  name: string
  status: StudentStatus
  failureReason: 'GRADE' | 'ATTENDANCE' | 'BOTH' | null
  finalGrade: number
  maxPossibleGrade: number
  attendancePercentage: number
  pointsUntilPass: number | null
  classesUntilFail: number | null
  missedAssignments: { id: string; name: string; dueDate: string }[]
}

export default class GetStudentStatusController {
  async handle({ params, request, response }: HttpContext) {
    const classId = params.id
    const filters = await request.validateUsing(getStudentStatusValidator)
    const subjectId = filters.subjectId
    const courseId = filters.courseId
    const academicPeriodId = filters.academicPeriodId

    // Find the class
    const classEntity = await Class_.query().where('id', classId).preload('school').first()

    if (!classEntity) {
      throw AppException.notFound('Turma não encontrada')
    }

    // Get the academic period from the parameter
    const academicPeriod = await AcademicPeriod.find(academicPeriodId)

    if (!academicPeriod) {
      throw AppException.notFound('Período letivo não encontrado')
    }

    // Get school configuration
    const school = await School.find(classEntity.schoolId)
    if (!school) {
      throw AppException.notFound('Escola não encontrada')
    }

    const minimumGrade = academicPeriod.minimumGradeOverride ?? school.minimumGrade ?? 6
    const minimumAttendancePercentage =
      academicPeriod.minimumAttendanceOverride ?? school.minimumAttendancePercentage ?? 75
    const calculationAlgorithm = school.calculationAlgorithm ?? 'AVERAGE'

    // Get students in the class using StudentHasLevel with course+period context
    const studentsInClass = await getStudents({ classId, courseId, academicPeriodId })

    if (studentsInClass.length === 0) {
      return response.ok([])
    }

    // Map to simpler format for rest of the function
    const students = studentsInClass.map((s) => ({
      id: s.studentId,
      name: s.student.user?.name ?? 'Nome não disponível',
    }))

    // Get TeacherHasClass for this class and subject
    const teacherHasClass = await db
      .from('TeacherHasClass')
      .where('classId', classId)
      .where('subjectId', subjectId)
      .where('isActive', true)
      .first()

    if (!teacherHasClass) {
      return response.ok([])
    }

    // Get all assignments for this subject/class
    const assignments = await Assignment.query()
      .whereHas('teacherHasClass', (q) => {
        q.where('classId', classId).where('subjectId', subjectId)
      })
      .orderBy('dueDate', 'asc')

    // Get student assignments
    const studentAssignments = await db
      .from('StudentHasAssignment')
      .whereIn(
        'assignmentId',
        assignments.map((a) => a.id)
      )
      .select('studentId', 'assignmentId', 'grade')

    // Get all exams for this subject/class
    const exams = await Exam.query()
      .where('classId', classId)
      .where('subjectId', subjectId)
      .orderBy('examDate', 'asc')

    // Get student exam grades
    const studentExamGrades =
      exams.length > 0
        ? await ExamGrade.query()
            .whereIn(
              'examId',
              exams.map((e) => e.id)
            )
            .select('studentId', 'examId', 'score', 'attended')
        : []

    // Get attendance records for this class/subject/academic period
    const attendanceRecords = await Attendance.query()
      .whereHas('calendarSlot', (csQuery) => {
        csQuery.where('teacherHasClassId', teacherHasClass.id).whereHas('calendar', (calQuery) => {
          calQuery.where('academicPeriodId', academicPeriod.id)
        })
      })
      .preload('calendarSlot')

    // Get student attendance
    const studentAttendance = await db
      .from('StudentHasAttendance')
      .whereIn(
        'attendanceId',
        attendanceRecords.map((a) => a.id)
      )
      .select('studentId', 'attendanceId', 'status')

    // Calculate max possible grade based on algorithm (assignments + exams)
    const gradableAssignments = assignments.filter((a) => (a.grade ?? 0) > 0)
    const gradableAssignmentIds = new Set(gradableAssignments.map((a) => a.id))
    const gradableExams = exams.filter((e) => e.maxScore > 0)
    const gradableExamIds = new Set(gradableExams.map((e) => e.id))
    const totalAssignmentPoints = gradableAssignments.reduce((sum, a) => sum + (a.grade ?? 0), 0)
    const totalExamPoints = gradableExams.reduce((sum, e) => sum + e.maxScore, 0)
    const totalItems = gradableAssignments.length + gradableExams.length

    const maxPossibleGrade =
      calculationAlgorithm === 'SUM'
        ? totalAssignmentPoints + totalExamPoints
        : totalItems > 0
          ? (totalAssignmentPoints + totalExamPoints) / totalItems
          : 0

    const usesSubPeriods = !!school.periodStructure

    // Build result for each student
    const results: (StudentStatusResult & { subPeriodGrades?: unknown[] })[] = await Promise.all(
      students.map(async (student) => {
        // Check if school uses sub-periods
        let subPeriodResult = null
        if (usesSubPeriods) {
          subPeriodResult = await SubPeriodGradeCalculator.calculateForStudent(
            school,
            academicPeriodId,
            student.id,
            subjectId,
            classId,
            calculationAlgorithm
          )
        }

        // Get student's assignment grades
        const studentAssignmentList = studentAssignments.filter((sa) => sa.studentId === student.id)
        const gradedAssignments = studentAssignmentList.filter(
          (sa) => sa.grade !== null && gradableAssignmentIds.has(sa.assignmentId)
        )

        // Get student's exam grades
        const studentExamList = studentExamGrades.filter((eg) => eg.studentId === student.id)
        const gradedExams = studentExamList.filter(
          (eg) => eg.score !== null && eg.attended && gradableExamIds.has(eg.examId)
        )

        // Calculate final grade (assignments + exams)
        let finalGrade = 0

        if (subPeriodResult !== null && subPeriodResult.finalGrade !== null) {
          finalGrade = subPeriodResult.finalGrade
        } else {
          const totalGradedItems = gradedAssignments.length + gradedExams.length

          if (totalGradedItems > 0) {
            const assignmentSum = gradedAssignments.reduce((sum, sa) => sum + (sa.grade ?? 0), 0)
            const examSum = gradedExams.reduce((sum, eg) => sum + (eg.score ?? 0), 0)

            if (calculationAlgorithm === 'SUM') {
              finalGrade = assignmentSum + examSum
            } else {
              finalGrade = (assignmentSum + examSum) / totalGradedItems
            }
          }
        }

        // Find missed assignments (not submitted or no grade)
        const missedAssignmentsList = assignments.filter((assignment) => {
          const studentAssignment = studentAssignmentList.find(
            (sa) => sa.assignmentId === assignment.id
          )
          return !studentAssignment || studentAssignment.grade === null
        })

        // Find missed exams (not attended or no score)
        const missedExamsList = exams.filter((exam) => {
          const studentExam = studentExamList.find((eg) => eg.examId === exam.id)
          return !studentExam || !studentExam.attended || studentExam.score === null
        })

        // Combine missed items
        const missedItems = [
          ...missedAssignmentsList.map((a) => ({
            id: a.id,
            name: a.name,
            dueDate: a.dueDate.toISO() ?? '',
          })),
          ...missedExamsList.map((e) => ({
            id: e.id,
            name: e.title,
            dueDate: e.examDate.toISO() ?? '',
          })),
        ]

        // Calculate attendance
        const studentAttendanceList = studentAttendance.filter((sa) => sa.studentId === student.id)
        const totalClassesWithRecords = studentAttendanceList.length
        const attendedClasses = studentAttendanceList.filter(
          (sa) => sa.status === 'PRESENT' || sa.status === 'LATE'
        ).length

        const attendancePercentage =
          totalClassesWithRecords > 0 ? (attendedClasses / totalClassesWithRecords) * 100 : 100

        // Calculate classes until fail (margin of 5 classes)
        const classesUntilFail =
          totalClassesWithRecords > 0
            ? Math.max(
                0,
                Math.floor(
                  attendedClasses - (totalClassesWithRecords * minimumAttendancePercentage) / 100
                ) + 5
              )
            : null

        const hasGradeCriteria = totalItems > 0

        // Calculate points until pass
        const pointsUntilPass = hasGradeCriteria ? Math.max(0, minimumGrade - finalGrade) : null

        // Determine status
        let status: StudentStatus

        // If no assignments, no exams AND no classes, we can't evaluate yet
        const hasNoData = !hasGradeCriteria && totalClassesWithRecords === 0

        // Check if close to attendance fail (5 or fewer classes margin)
        const hasAnyAbsence = attendedClasses < totalClassesWithRecords
        const isCloseToAttendanceFail =
          hasAnyAbsence &&
          classesUntilFail !== null &&
          classesUntilFail <= 5 &&
          classesUntilFail > 0

        let failureReason: StudentStatusResult['failureReason'] = null

        if (hasNoData) {
          status = 'IN_PROGRESS'
        } else {
          const isFailingGrade = hasGradeCriteria && finalGrade < minimumGrade
          const isFailingAttendance =
            totalClassesWithRecords > 0 && attendancePercentage < minimumAttendancePercentage

          const hasPassingGrade = !isFailingGrade
          const hasPassingAttendance = !isFailingAttendance

          if (!hasPassingGrade || !hasPassingAttendance) {
            status = 'FAILED'
            if (isFailingGrade && isFailingAttendance) {
              failureReason = 'BOTH'
            } else if (isFailingGrade) {
              failureReason = 'GRADE'
            } else {
              failureReason = 'ATTENDANCE'
            }
          } else if (isCloseToAttendanceFail) {
            status = 'AT_RISK_ATTENDANCE'
          } else if (
            pointsUntilPass !== null &&
            pointsUntilPass > 0 &&
            pointsUntilPass <= maxPossibleGrade * 0.2
          ) {
            status = 'AT_RISK_GRADE'
          } else {
            status = 'APPROVED'
          }
        }

        return {
          id: student.id,
          name: student.name,
          status,
          failureReason,
          finalGrade: Number.parseFloat(finalGrade.toFixed(1)),
          maxPossibleGrade: Number.parseFloat(maxPossibleGrade.toFixed(1)),
          attendancePercentage: Number.parseFloat(attendancePercentage.toFixed(1)),
          pointsUntilPass:
            pointsUntilPass !== null && pointsUntilPass > 0
              ? Number.parseFloat(pointsUntilPass.toFixed(1))
              : null,
          classesUntilFail: isCloseToAttendanceFail ? classesUntilFail : null,
          missedAssignments: missedItems,
          ...(subPeriodResult ? { subPeriodGrades: subPeriodResult.subPeriodGrades } : {}),
        }
      })
    )

    return response.ok(results)
  }
}
