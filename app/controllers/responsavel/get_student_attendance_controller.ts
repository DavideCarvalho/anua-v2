import type { HttpContext } from '@adonisjs/core/http'
import StudentHasAttendance from '#models/student_has_attendance'
import StudentHasResponsible from '#models/student_has_responsible'

export default class GetStudentAttendanceController {
  async handle({ params, request, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Nao autenticado' })
    }

    const { studentId } = params
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', user.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      return response.forbidden({
        message: 'Voce nao tem permissao para ver a frequencia deste aluno',
      })
    }

    // Get attendance records from StudentHasAttendance which links to Attendance and CalendarSlot
    const attendances = await StudentHasAttendance.query()
      .where('studentId', studentId)
      .preload('attendance', (query) => {
        query.preload('calendarSlot')
      })
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    // Calculate attendance stats
    const stats = await StudentHasAttendance.query()
      .where('studentId', studentId)
      .select('status')
      .count('* as count')
      .groupBy('status')

    const statsMap: Record<string, number> = {}
    stats.forEach((row: StudentHasAttendance) => {
      statsMap[row.status] = Number(row.$extras.count)
    })

    // Map model status values (PRESENT, ABSENT, LATE, EXCUSED)
    const totalClasses =
      (statsMap['PRESENT'] || 0) +
      (statsMap['ABSENT'] || 0) +
      (statsMap['LATE'] || 0) +
      (statsMap['EXCUSED'] || 0)

    const presentCount = (statsMap['PRESENT'] || 0) + (statsMap['LATE'] || 0)
    const attendanceRate = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0

    return response.ok({
      data: attendances.all().map((a) => ({
        id: a.id,
        date: a.attendance?.date?.toISO() || a.createdAt.toISO(),
        status: a.status,
        justification: a.justification,
      })),
      meta: attendances.getMeta(),
      summary: {
        totalClasses,
        presentCount: statsMap['PRESENT'] || 0,
        absentCount: statsMap['ABSENT'] || 0,
        lateCount: statsMap['LATE'] || 0,
        excusedCount: statsMap['EXCUSED'] || 0,
        attendanceRate,
      },
    })
  }
}
