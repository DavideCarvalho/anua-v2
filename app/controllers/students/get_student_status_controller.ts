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
import AppException from '#exceptions/app_exception'

type StudentStatus = 'APPROVED' | 'AT_RISK_GRADE' | 'AT_RISK_ATTENDANCE' | 'FAILED' | 'IN_PROGRESS'

interface StudentStatusResult {
  id: string
  name: string
  status: StudentStatus
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
    const subjectId = request.input('subjectId')
    const courseId = request.input('courseId')
    const academicPeriodId = request.input('academicPeriodId')

    if (!subjectId) {
      throw AppException.badRequest('subjectId é obrigatório')
    }

    if (!courseId || !academicPeriodId) {
      throw AppException.badRequest('courseId e academicPeriodId são obrigatórios')
    }

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

    const totalClasses = attendanceRecords.length

    // Calculate max possible grade based on algorithm (assignments + exams)
    const totalAssignmentPoints = assignments.reduce((sum, a) => sum + a.grade, 0)
    const totalExamPoints = exams.reduce((sum, e) => sum + e.maxScore, 0)
    const totalItems = assignments.length + exams.length

    const maxPossibleGrade =
      calculationAlgorithm === 'SUM'
        ? totalAssignmentPoints + totalExamPoints
        : totalItems > 0
          ? (totalAssignmentPoints + totalExamPoints) / totalItems
          : 0

    // Build result for each student
    const results: StudentStatusResult[] = students.map((student) => {
      // Get student's assignment grades
      const studentAssignmentList = studentAssignments.filter((sa) => sa.studentId === student.id)
      const gradedAssignments = studentAssignmentList.filter((sa) => sa.grade !== null)

      // Get student's exam grades
      const studentExamList = studentExamGrades.filter((eg) => eg.studentId === student.id)
      const gradedExams = studentExamList.filter((eg) => eg.score !== null && eg.attended)

      // Calculate final grade (assignments + exams)
      let finalGrade = 0
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
      const attendedClasses = studentAttendanceList.filter(
        (sa) => sa.status === 'PRESENT' || sa.status === 'LATE'
      ).length

      const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 100

      // Calculate classes until fail (margin of 5 classes)
      const classesUntilFail =
        totalClasses > 0
          ? Math.max(
              0,
              Math.floor(attendedClasses - (totalClasses * minimumAttendancePercentage) / 100) + 5
            )
          : null

      // Calculate points until pass
      const pointsUntilPass = Math.max(0, minimumGrade - finalGrade)

      // Determine status
      let status: StudentStatus

      // If no assignments, no exams AND no classes, we can't evaluate yet
      const hasNoData = totalItems === 0 && totalClasses === 0

      // Check if close to attendance fail (5 or fewer classes margin)
      const isCloseToAttendanceFail =
        classesUntilFail !== null && classesUntilFail <= 5 && classesUntilFail > 0

      if (hasNoData) {
        status = 'IN_PROGRESS'
      } else {
        const hasPassingGrade = totalItems === 0 || finalGrade >= minimumGrade
        const hasPassingAttendance =
          totalClasses === 0 || attendancePercentage >= minimumAttendancePercentage

        if (!hasPassingGrade || !hasPassingAttendance) {
          status = 'FAILED'
        } else if (isCloseToAttendanceFail) {
          status = 'AT_RISK_ATTENDANCE'
        } else if (pointsUntilPass > 0 && pointsUntilPass <= maxPossibleGrade * 0.2) {
          status = 'AT_RISK_GRADE'
        } else {
          status = 'APPROVED'
        }
      }

      return {
        id: student.id,
        name: student.name,
        status,
        finalGrade: Number.parseFloat(finalGrade.toFixed(1)),
        maxPossibleGrade: Number.parseFloat(maxPossibleGrade.toFixed(1)),
        attendancePercentage: Number.parseFloat(attendancePercentage.toFixed(1)),
        pointsUntilPass: pointsUntilPass > 0 ? Number.parseFloat(pointsUntilPass.toFixed(1)) : null,
        classesUntilFail: isCloseToAttendanceFail ? classesUntilFail : null,
        missedAssignments: missedItems,
      }
    })

    return response.ok(results)
  }
}
