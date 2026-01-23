import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'
import Student from '#models/student'
import db from '@adonisjs/lucid/services/db'

interface StudentAttendanceData {
  student: {
    id: string
    name: string
  }
  totalClasses: number
  presentCount: number
  absentCount: number
  lateCount: number
  justifiedCount: number
  attendancePercentage: number
}

export default class GetClassStudentsAttendanceController {
  async handle({ params, request, response }: HttpContext) {
    const classId = params.classId

    const class_ = await Class_.find(classId)
    if (!class_) {
      return response.notFound({ message: 'Turma não encontrada' })
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    // Get students in this class with their user info, ordered by name
    const students = await Student.query()
      .where('classId', classId)
      .preload('user')
      .paginate(page, limit)

    // Sort by user name after loading
    const sortedStudents = students.all().sort((a, b) => {
      const nameA = a.user?.name || ''
      const nameB = b.user?.name || ''
      return nameA.localeCompare(nameB)
    })

    // Get attendance counts for each student
    const studentIds = sortedStudents.map((s) => s.id)

    // Get attendance summary per student
    const attendanceSummary = await db
      .from('StudentHasAttendance')
      .select('studentId')
      .select(db.raw("COUNT(*) as total_classes"))
      .select(db.raw("SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present_count"))
      .select(db.raw("SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absent_count"))
      .select(db.raw("SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END) as late_count"))
      .select(db.raw("SUM(CASE WHEN status = 'JUSTIFIED' THEN 1 ELSE 0 END) as justified_count"))
      .whereIn('studentId', studentIds)
      .groupBy('studentId')

    // Create a map for quick lookup
    const summaryMap = new Map<string, any>()
    for (const row of attendanceSummary) {
      summaryMap.set(row.studentId, row)
    }

    // Build response data
    const data: StudentAttendanceData[] = sortedStudents.map((student) => {
      const summary = summaryMap.get(student.id)
      const totalClasses = summary ? Number(summary.total_classes) : 0
      const presentCount = summary ? Number(summary.present_count) : 0
      const absentCount = summary ? Number(summary.absent_count) : 0
      const lateCount = summary ? Number(summary.late_count) : 0
      const justifiedCount = summary ? Number(summary.justified_count) : 0

      // Calculate percentage (present + late + justified are considered as "attended")
      const attendedCount = presentCount + lateCount + justifiedCount
      const attendancePercentage = totalClasses > 0
        ? Math.round((attendedCount / totalClasses) * 100)
        : 0

      return {
        student: {
          id: student.id,
          name: student.user?.name || 'Nome não disponível',
        },
        totalClasses,
        presentCount,
        absentCount,
        lateCount,
        justifiedCount,
        attendancePercentage,
      }
    })

    return response.ok({
      data,
      meta: {
        total: students.total,
        perPage: students.perPage,
        currentPage: students.currentPage,
        lastPage: students.lastPage,
      },
    })
  }
}
