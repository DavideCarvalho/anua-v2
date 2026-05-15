import type { HttpContext } from '@adonisjs/core/http'
import StudentHasAttendance from '#models/student_has_attendance'
import StudentHasResponsible from '#models/student_has_responsible'
import AcademicSubPeriod from '#models/academic_sub_period'
import { getStudentAttendanceValidator } from '#validators/responsavel'
import AppException from '#exceptions/app_exception'

export default class GetStudentAttendanceController {
  async handle({ params, request, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId } = params
    const validated = await request.validateUsing(getStudentAttendanceValidator)
    const page = validated.page ?? 1
    const limit = validated.limit ?? 20
    const subPeriodId = validated.subPeriodId

    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para ver a frequência deste aluno')
    }

    let dateFrom: string | undefined
    let dateTo: string | undefined

    if (subPeriodId) {
      const subPeriod = await AcademicSubPeriod.query()
        .where('id', subPeriodId)
        .whereNull('deletedAt')
        .first()

      if (subPeriod) {
        dateFrom = subPeriod.startDate.toISO()!
        dateTo = subPeriod.endDate.toISO()!
      }
    }

    const attendancesQuery = StudentHasAttendance.query().where('studentId', studentId)

    if (dateFrom && dateTo) {
      attendancesQuery.whereHas('attendance', (q) => {
        q.where('date', '>=', dateFrom).where('date', '<=', dateTo)
      })
    }

    const attendances = await attendancesQuery
      .preload('attendance', (query) => {
        query.preload('calendarSlot')
      })
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    const statsQuery = StudentHasAttendance.query().where('studentId', studentId)

    if (dateFrom && dateTo) {
      statsQuery.whereHas('attendance', (q) => {
        q.where('date', '>=', dateFrom).where('date', '<=', dateTo)
      })
    }

    const stats = await statsQuery.select('status').count('* as count').groupBy('status')

    const statsMap: Record<string, number> = {}
    stats.forEach((row: StudentHasAttendance) => {
      statsMap[row.status] = Number(row.$extras.count)
    })

    const totalClasses =
      (statsMap['PRESENT'] || 0) +
      (statsMap['ABSENT'] || 0) +
      (statsMap['LATE'] || 0) +
      (statsMap['JUSTIFIED'] || 0)

    const presentCount = (statsMap['PRESENT'] || 0) + (statsMap['LATE'] || 0)
    const attendanceRate = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0

    const attendanceRecords = attendances.all().map((a) => ({
      id: a.id,
      date: a.attendance?.date?.toISO() || a.createdAt.toISO() || '',
      status: a.status,
      justification: a.justification,
    }))

    const summary = {
      totalClasses,
      presentCount: statsMap['PRESENT'] || 0,
      absentCount: statsMap['ABSENT'] || 0,
      lateCount: statsMap['LATE'] || 0,
      excusedCount: statsMap['JUSTIFIED'] || 0,
      attendanceRate,
    }

    return {
      data: attendanceRecords,
      meta: attendances.getMeta(),
      summary,
    }
  }
}
