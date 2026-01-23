import { BaseModelDto } from '@adocasts.com/dto/base'
import type TeacherAbsence from '#models/teacher_absence'

export default class TeacherAbsenceDto extends BaseModelDto {
  declare id: string
  declare absenceId: string
  declare calendarSlotId: string
  declare teacherIdTookPlace: string | null

  constructor(teacherAbsence?: TeacherAbsence) {
    super()

    if (!teacherAbsence) return

    this.id = teacherAbsence.id
    this.absenceId = teacherAbsence.absenceId
    this.calendarSlotId = teacherAbsence.calendarSlotId
    this.teacherIdTookPlace = teacherAbsence.teacherIdTookPlace
  }
}
