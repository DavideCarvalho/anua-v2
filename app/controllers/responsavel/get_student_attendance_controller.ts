import type { HttpContext } from '@adonisjs/core/http'
import Attendance from '#models/attendance'
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

    // Get attendance records
    const attendances = await Attendance.query()
      .where('studentId', studentId)
      .preload('classSchedule', (query) => {
        query.preload('subject')
      })
      .orderBy('date', 'desc')
      .paginate(page, limit)

    // Calculate attendance stats
    const stats = await Attendance.query()
      .where('studentId', studentId)
      .select('status')
      .count('* as count')
      .groupBy('status')

    const statsMap: Record<string, number> = {}
    stats.forEach((row: any) => {
      statsMap[row.status] = Number(row.$extras.count)
    })

    const totalClasses =
      (statsMap['PRESENT'] || 0) +
      (statsMap['ABSENT'] || 0) +
      (statsMap['LATE'] || 0) +
      (statsMap['JUSTIFIED'] || 0)

    const presentCount = (statsMap['PRESENT'] || 0) + (statsMap['LATE'] || 0)
    const attendanceRate = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0

    return response.ok({
      data: attendances.all().map((a) => ({
        id: a.id,
        date: a.createdAt,
        status: a.status,
        justification: a.justification,
        subject: a.classSchedule?.subject?.name || null,
      })),
      meta: attendances.getMeta(),
      summary: {
        totalClasses,
        presentCount: statsMap['PRESENT'] || 0,
        absentCount: statsMap['ABSENT'] || 0,
        lateCount: statsMap['LATE'] || 0,
        justifiedCount: statsMap['JUSTIFIED'] || 0,
        attendanceRate,
      },
    })
  }
}
