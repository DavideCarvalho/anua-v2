import { BaseModelDto } from '@adocasts.com/dto/base'
import type ExtraClassSchedule from '#models/extra_class_schedule'
import type { DateTime } from 'luxon'

export default class ExtraClassScheduleDto extends BaseModelDto {
  declare id: string
  declare extraClassId: string
  declare weekDay: number
  declare startTime: string
  declare endTime: string
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: ExtraClassSchedule) {
    super()
    if (!model) return

    this.id = model.id
    this.extraClassId = model.extraClassId
    this.weekDay = model.weekDay
    this.startTime = model.startTime
    this.endTime = model.endTime
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
