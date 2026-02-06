import { BaseModelDto } from '@adocasts.com/dto/base'
import type ExtraClass from '#models/extra_class'
import type { DateTime } from 'luxon'
import ExtraClassScheduleDto from './extra_class_schedule.dto.js'

export default class ExtraClassDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string
  declare description: string | null
  declare schoolId: string
  declare academicPeriodId: string
  declare contractId: string
  declare teacherId: string
  declare maxStudents: number | null
  declare isActive: boolean
  declare createdAt: DateTime
  declare updatedAt: DateTime
  declare schedules?: ExtraClassScheduleDto[]
  declare enrollmentCount?: number

  constructor(model?: ExtraClass) {
    super()
    if (!model) return

    this.id = model.id
    this.name = model.name
    this.slug = model.slug
    this.description = model.description
    this.schoolId = model.schoolId
    this.academicPeriodId = model.academicPeriodId
    this.contractId = model.contractId
    this.teacherId = model.teacherId
    this.maxStudents = model.maxStudents
    this.isActive = model.isActive
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
    this.schedules = model.schedules
      ? model.schedules.map((s) => new ExtraClassScheduleDto(s))
      : undefined
  }
}
