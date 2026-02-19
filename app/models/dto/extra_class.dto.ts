import { BaseModelDto } from '@adocasts.com/dto/base'
import type ExtraClass from '#models/extra_class'
import type { DateTime } from 'luxon'
import ExtraClassScheduleDto from './extra_class_schedule.dto.js'
import { ContractDto } from './contract.dto.js'

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
  declare createdAt: Date
  declare updatedAt: Date
  declare schedules?: ExtraClassScheduleDto[]
  declare contract?: ContractDto
  declare teacherName?: string
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
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
    this.schedules = model.schedules
      ? model.schedules.map((s) => new ExtraClassScheduleDto(s))
      : undefined
    this.contract = model.contract ? new ContractDto(model.contract) : undefined
    this.teacherName = model.teacher?.user?.name
    this.enrollmentCount = (model.$extras as any)?.enrollments_count
      ? Number((model.$extras as any).enrollments_count)
      : undefined
  }
}
