import { BaseModelDto } from '@adocasts.com/dto/base'
import type ClassSchedule from '#models/class_schedule'
import type { DateTime } from 'luxon'

export default class ClassScheduleDto extends BaseModelDto {
  declare id: string
  declare classId: string
  declare name: string
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: ClassSchedule) {
    super()

    if (!model) return

    this.id = model.id
    this.classId = model.classId
    this.name = model.name
    this.isActive = model.isActive
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
