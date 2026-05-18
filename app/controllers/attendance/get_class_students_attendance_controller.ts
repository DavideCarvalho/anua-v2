import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'
import StudentHasLevel from '#models/student_has_level'
import AcademicSubPeriod from '#models/academic_sub_period'
import db from '@adonisjs/lucid/services/db'
import GetClassStudentsAttendanceResponseDto from './dtos/get_class_students_attendance_response.dto.js'
import AppException from '#exceptions/app_exception'
import { getClassStudentsAttendanceValidator } from '#validators/attendance'

type SortBy = 'name' | 'present' | 'absent' | 'late' | 'justified' | 'percentage'
type SortDir = 'asc' | 'desc'

export default class GetClassStudentsAttendanceController {
  async handle({ params, request, response }: HttpContext) {
    const classId = params.classId
    const filters = await request.validateUsing(getClassStudentsAttendanceValidator)
    const courseId = filters.courseId
    const academicPeriodId = filters.academicPeriodId
    const subPeriodId = filters.subPeriodId

    let dateStart: string | undefined
    let dateEnd: string | undefined
    if (subPeriodId) {
      const subPeriod = await AcademicSubPeriod.find(subPeriodId)
      if (subPeriod) {
        dateStart = subPeriod.startDate.toISO() ?? undefined
        dateEnd = subPeriod.endDate.toISO() ?? undefined
      }
    }

    const classEntity = await Class_.find(classId)
    if (!classEntity) {
      throw AppException.notFound('Turma não encontrada')
    }

    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    const sortBy: SortBy = filters.sortBy ?? 'name'
    const sortDir: SortDir = filters.sortDir ?? 'asc'

    // Como o sort pode ser por contagens agregadas, carregamos todos os alunos
    // da turma e ordenamos depois de juntar com as estatísticas. Turmas escolares
    // raramente passam de ~40 alunos; o custo é aceitável e evita a complicação
    // de fazer o sort em SQL com joins agregados.
    const studentLevels = await StudentHasLevel.query()
      .where('classId', classId)
      .whereHas('levelAssignedToCourseAcademicPeriod', (laQuery) => {
        laQuery.where('isActive', true).whereHas('courseHasAcademicPeriod', (caQuery) => {
          caQuery.where('courseId', courseId).where('academicPeriodId', academicPeriodId)
        })
      })
      .preload('student', (sq) => sq.preload('user'))

    const studentIds = studentLevels.map((sl) => sl.studentId)

    // Os contadores precisam ser DA turma, não do aluno no sistema todo.
    // Aluno que troca de turma mid-período continuaria contando presenças
    // antigas se não filtrasse. Por isso o join via CalendarSlot → Calendar.
    const summaryQuery =
      studentIds.length > 0
        ? db
            .from('StudentHasAttendance')
            .join('Attendance', 'StudentHasAttendance.attendanceId', '=', 'Attendance.id')
            .join('CalendarSlot', 'Attendance.calendarSlotId', '=', 'CalendarSlot.id')
            .join('Calendar', 'CalendarSlot.calendarId', '=', 'Calendar.id')
            .select('StudentHasAttendance.studentId as studentId')
            .select(db.raw('COUNT(*) as total_classes'))
            .select(
              db.raw(
                'SUM(CASE WHEN "StudentHasAttendance".status = \'PRESENT\' THEN 1 ELSE 0 END) as present_count'
              )
            )
            .select(
              db.raw(
                'SUM(CASE WHEN "StudentHasAttendance".status = \'ABSENT\' THEN 1 ELSE 0 END) as absent_count'
              )
            )
            .select(
              db.raw(
                'SUM(CASE WHEN "StudentHasAttendance".status = \'LATE\' THEN 1 ELSE 0 END) as late_count'
              )
            )
            .select(
              db.raw(
                'SUM(CASE WHEN "StudentHasAttendance".status = \'JUSTIFIED\' THEN 1 ELSE 0 END) as justified_count'
              )
            )
            .whereIn('StudentHasAttendance.studentId', studentIds)
            .where('Calendar.classId', classId)
            .where('Calendar.academicPeriodId', academicPeriodId)
            .groupBy('StudentHasAttendance.studentId')
        : null

    if (summaryQuery && dateStart && dateEnd) {
      summaryQuery.where('Attendance.date', '>=', dateStart).where('Attendance.date', '<=', dateEnd)
    }

    const attendanceSummary = summaryQuery ? await summaryQuery : []

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

    const enriched = studentLevels.map((sl) => {
      const summary = summaryMap.get(sl.studentId)
      const dto = new GetClassStudentsAttendanceResponseDto(sl, {
        totalClasses: summary ? Number(summary.total_classes) : 0,
        presentCount: summary ? Number(summary.present_count) : 0,
        absentCount: summary ? Number(summary.absent_count) : 0,
        lateCount: summary ? Number(summary.late_count) : 0,
        justifiedCount: summary ? Number(summary.justified_count) : 0,
      })
      return dto
    })

    const dir = sortDir === 'desc' ? -1 : 1
    enriched.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'name':
          cmp = a.student.name.localeCompare(b.student.name, 'pt-BR', { sensitivity: 'base' })
          break
        case 'present':
          cmp = a.presentCount - b.presentCount
          break
        case 'absent':
          cmp = a.absentCount - b.absentCount
          break
        case 'late':
          cmp = a.lateCount - b.lateCount
          break
        case 'justified':
          cmp = a.justifiedCount - b.justifiedCount
          break
        case 'percentage':
          cmp = a.attendancePercentage - b.attendancePercentage
          break
      }
      // Tie-breaker estável: nome em asc. Mantém a tabela previsível quando há empate.
      if (cmp === 0 && sortBy !== 'name') {
        cmp = a.student.name.localeCompare(b.student.name, 'pt-BR', { sensitivity: 'base' })
      }
      return cmp * dir
    })

    const total = enriched.length
    const lastPage = Math.max(1, Math.ceil(total / limit))
    const safePage = Math.min(page, lastPage)
    const start = (safePage - 1) * limit
    const data = enriched.slice(start, start + limit)

    return response.ok({
      data,
      meta: {
        total,
        perPage: limit,
        currentPage: safePage,
        lastPage,
      },
    })
  }
}
