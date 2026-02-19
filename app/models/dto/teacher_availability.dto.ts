import { BaseModelDto } from '@adocasts.com/dto/base'
import type TeacherAvailability from '#models/teacher_availability'
import type { DateTime } from 'luxon'

export default class TeacherAvailabilityDto extends BaseModelDto {
  declare id: string
  declare teacherId: string
  declare day: string
  declare startTime: string
  declare endTime: string
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: TeacherAvailability) {
    super()

    if (!model) return

    this.id = model.id
    this.teacherId = model.teacherId
    this.day = model.day
    this.startTime = model.startTime
    this.endTime = model.endTime
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
