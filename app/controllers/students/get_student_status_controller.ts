import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Class_ from '#models/class'
import School from '#models/school'
import AcademicPeriod from '#models/academic_period'
import Assignment from '#models/assignment'
import Attendance from '#models/attendance'

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

    if (!subjectId) {
      return response.badRequest({ message: 'subjectId é obrigatório' })
    }

    // Find the class
    const classEntity = await Class_.query()
      .where('id', classId)
      .preload('school')
      .first()

    if (!classEntity) {
      return response.notFound({ message: 'Turma não encontrada' })
    }

    // Get current or last active academic period for the school
    const academicPeriod = await AcademicPeriod.query()
      .where('schoolId', classEntity.schoolId)
      .where('isActive', true)
      .orderBy('startDate', 'desc')
      .first()

    if (!academicPeriod) {
      return response.ok([])
    }

    // Get school configuration
    const school = await School.find(classEntity.schoolId)
    if (!school) {
      return response.notFound({ message: 'Escola não encontrada' })
    }

    const minimumGrade = academicPeriod.minimumGradeOverride ?? school.minimumGrade ?? 6
    const minimumAttendancePercentage =
      academicPeriod.minimumAttendanceOverride ?? school.minimumAttendancePercentage ?? 75
    const calculationAlgorithm = school.calculationAlgorithm ?? 'AVERAGE'

    // Get students in the class
    const students = await db
      .from('Student')
      .join('User', 'Student.id', 'User.id')
      .where('Student.classId', classId)
      .whereNull('User.deletedAt')
      .select('Student.id', 'User.name')

    if (students.length === 0) {
      return response.ok([])
    }

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

    // Get all assignments for this subject/class/academic period
    const assignments = await Assignment.query()
      .where('teacherHasClassId', teacherHasClass.id)
      .where('academicPeriodId', academicPeriod.id)
      .orderBy('dueDate', 'asc')

    // Get student assignments
    const studentAssignments = await db
      .from('StudentHasAssignment')
      .whereIn(
        'assignmentId',
        assignments.map((a) => a.id)
      )
      .select('studentId', 'assignmentId', 'grade')

    // Get attendance records for this class/subject/academic period
    const attendanceRecords = await Attendance.query()
      .whereHas('calendarSlot', (csQuery) => {
        csQuery
          .where('teacherHasClassId', teacherHasClass.id)
          .whereHas('calendar', (calQuery) => {
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

    // Calculate max possible grade based on algorithm
    const maxPossibleGrade =
      calculationAlgorithm === 'SUM'
        ? assignments.reduce((sum, a) => sum + a.grade, 0)
        : assignments.length > 0
          ? assignments.reduce((sum, a) => sum + a.grade, 0) / assignments.length
          : 0

    // Build result for each student
    const results: StudentStatusResult[] = students.map((student) => {
      // Get student's assignment grades
      const studentAssignmentList = studentAssignments.filter(
        (sa) => sa.studentId === student.id
      )
      const gradedAssignments = studentAssignmentList.filter((sa) => sa.grade !== null)

      // Calculate final grade
      let finalGrade = 0
      if (gradedAssignments.length > 0) {
        if (calculationAlgorithm === 'SUM') {
          finalGrade = gradedAssignments.reduce((sum, sa) => sum + (sa.grade ?? 0), 0)
        } else {
          const sum = gradedAssignments.reduce((sum, sa) => sum + (sa.grade ?? 0), 0)
          finalGrade = sum / gradedAssignments.length
        }
      }

      // Find missed assignments (not submitted or no grade)
      const missedAssignments = assignments.filter((assignment) => {
        const studentAssignment = studentAssignmentList.find(
          (sa) => sa.assignmentId === assignment.id
        )
        return !studentAssignment || studentAssignment.grade === null
      })

      // Calculate attendance
      const studentAttendanceList = studentAttendance.filter(
        (sa) => sa.studentId === student.id
      )
      const attendedClasses = studentAttendanceList.filter(
        (sa) => sa.status === 'PRESENT' || sa.status === 'LATE'
      ).length

      const attendancePercentage =
        totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 100

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

      // If no assignments AND no classes, we can't evaluate yet
      const hasNoData = assignments.length === 0 && totalClasses === 0

      // Check if close to attendance fail (5 or fewer classes margin)
      const isCloseToAttendanceFail =
        classesUntilFail !== null && classesUntilFail <= 5 && classesUntilFail > 0

      if (hasNoData) {
        status = 'IN_PROGRESS'
      } else {
        const hasPassingGrade = assignments.length === 0 || finalGrade >= minimumGrade
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
        missedAssignments: missedAssignments.map((a) => ({
          id: a.id,
          name: a.name,
          dueDate: a.dueDate.toISO() ?? '',
        })),
      }
    })

    return response.ok(results)
  }
}
