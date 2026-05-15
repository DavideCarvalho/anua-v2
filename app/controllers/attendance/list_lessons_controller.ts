import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Attendance from '#models/attendance'
import AcademicSubPeriod from '#models/academic_sub_period'
import { listLessonsValidator } from '#validators/attendance'

type SortBy = 'date' | 'present' | 'absent' | 'late' | 'justified'
type SortDir = 'asc' | 'desc'

interface LessonCounts {
  present: number
  absent: number
  late: number
  excused: number
  total: number
}

/**
 * Lista cronológica de chamadas de uma turma. Suporta ordenação por data ou
 * por contagens agregadas — quando o sort é agregado, carregamos todas as
 * aulas do filtro, juntamos com os counts e paginamos em memória (turmas
 * raramente passam de algumas dezenas de aulas por bimestre).
 */
export default class ListLessonsController {
  async handle({ request, response }: HttpContext) {
    const filters = await request.validateUsing(listLessonsValidator)
    const page = filters.page ?? 1
    const limit = filters.limit ?? 30
    const sortBy: SortBy = filters.sortBy ?? 'date'
    const sortDir: SortDir = filters.sortDir ?? 'desc'

    let dateStart: string | undefined
    let dateEnd: string | undefined
    if (filters.subPeriodId) {
      const subPeriod = await AcademicSubPeriod.find(filters.subPeriodId)
      if (subPeriod) {
        dateStart = subPeriod.startDate.toISO() ?? undefined
        dateEnd = subPeriod.endDate.toISO() ?? undefined
      }
    }

    const baseQuery = Attendance.query()
      .whereHas('calendarSlot', (sq) => {
        sq.whereHas('calendar', (cq) => {
          cq.where('classId', filters.classId).where('academicPeriodId', filters.academicPeriodId)
        })
        if (filters.subjectId) {
          sq.whereHas('teacherHasClass', (tq) => tq.where('subjectId', filters.subjectId!))
        }
      })
      .preload('calendarSlot', (sq) => {
        sq.preload('teacherHasClass', (tq) => {
          tq.preload('subject')
          tq.preload('teacher', (teacherQ) => teacherQ.preload('user'))
        })
      })
      .preload('createdBy')
      .preload('lastEditedBy')

    if (dateStart) baseQuery.where('date', '>=', dateStart)
    if (dateEnd) baseQuery.where('date', '<=', dateEnd)

    if (sortBy === 'date') {
      // Caminho rápido: ordenação puramente em SQL com paginação nativa.
      const paginated = await baseQuery.orderBy('date', sortDir).paginate(page, limit)

      const attendanceIds = paginated.all().map((a) => a.id)
      const counts = await this.loadStatusCounts(attendanceIds)
      const data = paginated.all().map((a) => this.mapAttendance(a, counts))

      return response.ok({
        data,
        meta: {
          total: paginated.total,
          perPage: paginated.perPage,
          currentPage: paginated.currentPage,
          lastPage: paginated.lastPage,
        },
      })
    }

    // Caminho com sort agregado: carrega tudo, ordena em memória, depois pagina.
    const allLessons = await baseQuery
    const allIds = allLessons.map((a) => a.id)
    const countsMap = await this.loadStatusCounts(allIds)

    const dir = sortDir === 'asc' ? 1 : -1
    const sorted = [...allLessons].sort((a, b) => {
      const ca = countsMap.get(a.id) ?? this.emptyCounts()
      const cb = countsMap.get(b.id) ?? this.emptyCounts()
      const va = this.pickCount(ca, sortBy)
      const vb = this.pickCount(cb, sortBy)
      let cmp = va - vb
      // Tie-breaker estável: data desc, pra empates ficarem cronológicos.
      if (cmp === 0) {
        const da = a.date?.toMillis() ?? 0
        const dbm = b.date?.toMillis() ?? 0
        cmp = dbm - da
      }
      return cmp * dir
    })

    const total = sorted.length
    const lastPage = Math.max(1, Math.ceil(total / limit))
    const safePage = Math.min(page, lastPage)
    const slice = sorted.slice((safePage - 1) * limit, safePage * limit)
    const data = slice.map((a) => this.mapAttendance(a, countsMap))

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

  private emptyCounts(): LessonCounts {
    return { present: 0, absent: 0, late: 0, excused: 0, total: 0 }
  }

  private pickCount(counts: LessonCounts, by: Exclude<SortBy, 'date'>) {
    switch (by) {
      case 'present':
        return counts.present
      case 'absent':
        return counts.absent
      case 'late':
        return counts.late
      case 'justified':
        return counts.excused
    }
  }

  private mapAttendance(a: Attendance, countsMap: Map<string, LessonCounts>) {
    const slot = a.calendarSlot
    const teacherHasClass = slot?.teacherHasClass
    const subject = teacherHasClass?.subject
    const teacherUser = teacherHasClass?.teacher?.user
    const c = countsMap.get(a.id) ?? this.emptyCounts()

    return {
      id: a.id,
      date: a.date.toISO(),
      slot: slot
        ? {
            id: slot.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            subject: subject ? { id: subject.id, name: subject.name } : null,
            teacher: teacherUser ? { id: teacherUser.id, name: teacherUser.name } : null,
          }
        : null,
      counts: c,
      createdBy: a.createdBy ? { id: a.createdBy.id, name: a.createdBy.name } : null,
      createdAt: a.createdAt.toISO(),
      lastEditedBy: a.lastEditedBy ? { id: a.lastEditedBy.id, name: a.lastEditedBy.name } : null,
      lastEditedAt: a.lastEditedAt?.toISO() ?? null,
    }
  }

  private async loadStatusCounts(attendanceIds: string[]) {
    const result = new Map<string, LessonCounts>()
    if (attendanceIds.length === 0) return result

    const rows = await db
      .from('StudentHasAttendance')
      .whereIn('attendanceId', attendanceIds)
      .select('attendanceId')
      .select(db.raw('COUNT(*) as total'))
      .select(db.raw("SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present"))
      .select(db.raw("SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absent"))
      .select(db.raw("SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END) as late"))
      .select(db.raw("SUM(CASE WHEN status = 'JUSTIFIED' THEN 1 ELSE 0 END) as excused"))
      .groupBy('attendanceId')

    for (const row of rows) {
      result.set(row.attendanceId, {
        present: Number(row.present ?? 0),
        absent: Number(row.absent ?? 0),
        late: Number(row.late ?? 0),
        excused: Number(row.excused ?? 0),
        total: Number(row.total ?? 0),
      })
    }
    return result
  }
}
