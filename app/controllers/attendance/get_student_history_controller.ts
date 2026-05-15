import type { HttpContext } from '@adonisjs/core/http'
import StudentHasAttendance from '#models/student_has_attendance'
import AcademicSubPeriod from '#models/academic_sub_period'
import { getStudentHistoryValidator } from '#validators/attendance'

/**
 * Histórico cronológico de presenças de um aluno em uma turma. Alimenta a
 * vista "Por aluno" (drill-down) na tela de presenças. Cada item traz a
 * aula correspondente, a matéria e a última edição registrada — suficiente
 * pra exibir e abrir o popover de edição cirúrgica.
 */
export default class GetStudentHistoryController {
  async handle({ params, request, response }: HttpContext) {
    const studentId = params.studentId
    const filters = await request.validateUsing(getStudentHistoryValidator)
    const page = filters.page ?? 1
    const limit = filters.limit ?? 30

    let dateStart: string | undefined
    let dateEnd: string | undefined
    if (filters.subPeriodId) {
      const subPeriod = await AcademicSubPeriod.find(filters.subPeriodId)
      if (subPeriod) {
        dateStart = subPeriod.startDate.toISO() ?? undefined
        dateEnd = subPeriod.endDate.toISO() ?? undefined
      }
    }

    const query = StudentHasAttendance.query()
      .where('studentId', studentId)
      .whereHas('attendance', (aq) => {
        aq.whereHas('calendarSlot', (sq) => {
          sq.whereHas('calendar', (cq) => {
            cq.where('classId', filters.classId).where('academicPeriodId', filters.academicPeriodId)
          })
        })
        if (dateStart) aq.where('date', '>=', dateStart)
        if (dateEnd) aq.where('date', '<=', dateEnd)
      })
      .preload('attendance', (aq) => {
        aq.preload('calendarSlot', (sq) => {
          sq.preload('teacherHasClass', (tq) => {
            tq.preload('subject')
            tq.preload('teacher', (teacherQ) => teacherQ.preload('user'))
          })
        })
      })
      .preload('lastEditedBy')

    const paginated = await query.orderBy('createdAt', 'desc').paginate(page, limit)

    const data = paginated.all().map((sha) => {
      const slot = sha.attendance?.calendarSlot
      const teacherHasClass = slot?.teacherHasClass
      const subject = teacherHasClass?.subject
      const teacherUser = teacherHasClass?.teacher?.user

      return {
        id: sha.id,
        status: sha.status,
        justification: sha.justification,
        attendance: {
          id: sha.attendanceId,
          date: sha.attendance?.date.toISO() ?? null,
          slot: slot
            ? {
                id: slot.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
                subject: subject ? { id: subject.id, name: subject.name } : null,
                teacher: teacherUser ? { id: teacherUser.id, name: teacherUser.name } : null,
              }
            : null,
        },
        lastEdit:
          sha.lastEditedAt && sha.lastEditedBy
            ? {
                editedBy: { id: sha.lastEditedBy.id, name: sha.lastEditedBy.name },
                editedAt: sha.lastEditedAt.toISO(),
              }
            : null,
      }
    })

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
}
