import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'
import StudentHasLevel from '#models/student_has_level'
import db from '@adonisjs/lucid/services/db'
import GetClassStudentsAttendanceResponseDto from './dtos/get_class_students_attendance_response.dto.js'
import AppException from '#exceptions/app_exception'

export default class GetClassStudentsAttendanceController {
  async handle({ params, request, response }: HttpContext) {
    const classId = params.classId
    const courseId = request.input('courseId')
    const academicPeriodId = request.input('academicPeriodId')

    if (!courseId || !academicPeriodId) {
      throw AppException.badRequest('courseId e academicPeriodId são obrigatórios')
    }

    const classEntity = await Class_.find(classId)
    if (!classEntity) {
      throw AppException.notFound('Turma não encontrada')
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    // Get students using validated context (course + period)
    const studentLevels = await StudentHasLevel.query()
      .where('classId', classId)
      .whereHas('levelAssignedToCourseAcademicPeriod', (laQuery) => {
        laQuery.where('isActive', true).whereHas('courseHasAcademicPeriod', (caQuery) => {
          caQuery.where('courseId', courseId).where('academicPeriodId', academicPeriodId)
        })
      })
      .preload('student', (sq) => sq.preload('user'))
      .orderBy('createdAt', 'asc')
      .paginate(page, limit)

    // Get student IDs for attendance query
    const studentIds = studentLevels.all().map((sl) => sl.studentId)

    // Get attendance summary per student
    const attendanceSummary =
      studentIds.length > 0
        ? await db
            .from('StudentHasAttendance')
            .select('studentId')
            .select(db.raw('COUNT(*) as total_classes'))
            .select(db.raw("SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present_count"))
            .select(db.raw("SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absent_count"))
            .select(db.raw("SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END) as late_count"))
            .select(
              db.raw("SUM(CASE WHEN status = 'JUSTIFIED' THEN 1 ELSE 0 END) as justified_count")
            )
            .whereIn('studentId', studentIds)
            .groupBy('studentId')
        : []

    // Create a map for quick lookup
    interface AttendanceSummaryRow {
      studentId: string
      total_classes: string | number
      present_count: string | number
      absent_count: string | number
      late_count: string | number
      justified_count: string | number
    }

    const summaryMap = new Map<string, AttendanceSummaryRow>()
    for (const row of attendanceSummary) {
      summaryMap.set(row.studentId, row)
    }

    // Sort by name and build DTOs
    const sortedStudentLevels = studentLevels.all().sort((a, b) => {
      const nameA = a.student?.user?.name || ''
      const nameB = b.student?.user?.name || ''
      return nameA.localeCompare(nameB)
    })

    const data = sortedStudentLevels.map((sl) => {
      const summary = summaryMap.get(sl.studentId)
      return new GetClassStudentsAttendanceResponseDto(sl, {
        totalClasses: summary ? Number(summary.total_classes) : 0,
        presentCount: summary ? Number(summary.present_count) : 0,
        absentCount: summary ? Number(summary.absent_count) : 0,
        lateCount: summary ? Number(summary.late_count) : 0,
        justifiedCount: summary ? Number(summary.justified_count) : 0,
      })
    })

    return response.ok({
      data,
      meta: {
        total: studentLevels.total,
        perPage: studentLevels.perPage,
        currentPage: studentLevels.currentPage,
        lastPage: studentLevels.lastPage,
      },
    })
  }
}
