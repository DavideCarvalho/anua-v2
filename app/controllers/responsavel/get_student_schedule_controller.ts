import type { HttpContext } from '@adonisjs/core/http'
import StudentHasResponsible from '#models/student_has_responsible'
import Student from '#models/student'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'
import AcademicPeriod from '#models/academic_period'
import {
  StudentScheduleResponseDto,
  ScheduleDayDto,
  ScheduleSlotDto,
  ScheduleSubjectDto,
  SubjectWithTeacherDto,
} from '#models/dto/student_schedule_response.dto'

const DAY_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terca-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sabado',
}

export default class GetStudentScheduleController {
  async handle({ params, response, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      return response.unauthorized({ message: 'Nao autenticado' })
    }

    const { studentId } = params

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      return response.forbidden({
        message: 'Voce nao tem permissao para ver o horario deste aluno',
      })
    }

    // Get student with class
    const student = await Student.query().where('id', studentId).preload('class').first()

    if (!student || !student.classId) {
      return response.notFound({ message: 'Aluno nao encontrado ou sem turma' })
    }

    // Find current active academic period for the student's school
    const activeAcademicPeriod = await AcademicPeriod.query()
      .where('schoolId', student.class.schoolId)
      .where('isActive', true)
      .first()

    if (!activeAcademicPeriod) {
      return new StudentScheduleResponseDto({
        className: student.class.name,
        scheduleByDay: {},
        subjects: [],
        message: 'Nenhum periodo letivo ativo encontrado',
      })
    }

    // Find active calendar for this class and period
    const calendar = await Calendar.query()
      .where('classId', student.classId)
      .where('academicPeriodId', activeAcademicPeriod.id)
      .where('isActive', true)
      .where('isCanceled', false)
      .first()

    if (!calendar) {
      return new StudentScheduleResponseDto({
        className: student.class.name,
        scheduleByDay: {},
        subjects: [],
        message: 'Horario nao definido para esta turma',
      })
    }

    // Get slots with teacher and subject info
    const slots = await CalendarSlot.query()
      .where('calendarId', calendar.id)
      .preload('teacherHasClass', (query) => {
        query.preload('teacher', (tq) => {
          tq.preload('user')
        })
        query.preload('subject')
      })
      .orderBy('classWeekDay')
      .orderBy('startTime')

    // Group schedule by day
    const scheduleByDay: Record<string, ScheduleDayDto> = {}
    const subjectsMap = new Map<string, SubjectWithTeacherDto>()

    for (const slot of slots) {
      const dayKey = slot.classWeekDay.toString()
      const dayLabel = DAY_LABELS[slot.classWeekDay] || `Dia ${slot.classWeekDay}`

      if (!scheduleByDay[dayKey]) {
        scheduleByDay[dayKey] = new ScheduleDayDto({
          label: dayLabel,
          slots: [],
        })
      }

      let subjectDto: ScheduleSubjectDto | null = null
      let teacherName: string | null = null

      if (slot.teacherHasClass && !slot.isBreak) {
        subjectDto = new ScheduleSubjectDto({
          id: slot.teacherHasClass.subject.id,
          name: slot.teacherHasClass.subject.name,
        })
        teacherName = slot.teacherHasClass.teacher.user.name

        // Add to subjects map
        if (!subjectsMap.has(slot.teacherHasClass.subject.id)) {
          subjectsMap.set(
            slot.teacherHasClass.subject.id,
            new SubjectWithTeacherDto({
              id: slot.teacherHasClass.subject.id,
              name: slot.teacherHasClass.subject.name,
              teacherName: slot.teacherHasClass.teacher.user.name,
            })
          )
        }
      }

      const slotDto = new ScheduleSlotDto({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBreak: slot.isBreak,
        subject: subjectDto,
        teacherName,
      })

      scheduleByDay[dayKey].slots.push(slotDto)
    }

    return new StudentScheduleResponseDto({
      className: student.class.name,
      scheduleByDay,
      subjects: Array.from(subjectsMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    })
  }
}
