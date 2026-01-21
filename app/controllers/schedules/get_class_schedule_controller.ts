import type { HttpContext } from '@adonisjs/core/http'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'
import TeacherHasClass from '#models/teacher_has_class'

export default class GetClassScheduleController {
  async handle({ params, request, response }: HttpContext) {
    const classId = params.classId
    const academicPeriodId = request.input('academicPeriodId')

    if (!academicPeriodId) {
      return response.badRequest({ error: 'academicPeriodId is required' })
    }

    // Find active calendar for this class and period
    const calendar = await Calendar.query()
      .where('classId', classId)
      .where('academicPeriodId', academicPeriodId)
      .where('isActive', true)
      .where('isCanceled', false)
      .first()

    // Get slots if calendar exists
    let slots: CalendarSlot[] = []
    if (calendar) {
      slots = await CalendarSlot.query()
        .where('calendarId', calendar.id)
        .preload('teacherHasClass', (query) => {
          query.preload('teacher', (tq) => {
            tq.preload('user')
          })
          query.preload('subject')
        })
        .orderBy('classWeekDay')
        .orderBy('startTime')
    }

    // Get all teacher-class assignments for this class
    const teacherClasses = await TeacherHasClass.query()
      .where('classId', classId)
      .where('isActive', true)
      .preload('teacher', (query) => {
        query.preload('user')
      })
      .preload('subject')

    return response.ok({
      calendar: calendar
        ? {
            id: calendar.id,
            name: calendar.name,
            isActive: calendar.isActive,
          }
        : null,
      slots: slots.map((slot) => ({
        id: slot.id,
        teacherHasClassId: slot.teacherHasClassId,
        classWeekDay: slot.classWeekDay,
        startTime: slot.startTime,
        endTime: slot.endTime,
        minutes: slot.minutes,
        isBreak: slot.isBreak,
        teacherHasClass: slot.teacherHasClass
          ? {
              id: slot.teacherHasClass.id,
              teacher: {
                id: slot.teacherHasClass.teacher.id,
                user: { name: slot.teacherHasClass.teacher.user.name },
              },
              subject: {
                id: slot.teacherHasClass.subject.id,
                name: slot.teacherHasClass.subject.name,
              },
            }
          : null,
      })),
      teacherClasses: teacherClasses.map((tc) => ({
        id: tc.id,
        subjectQuantity: tc.subjectQuantity,
        teacher: {
          id: tc.teacher.id,
          user: { name: tc.teacher.user.name },
        },
        subject: {
          id: tc.subject.id,
          name: tc.subject.name,
        },
      })),
    })
  }
}
