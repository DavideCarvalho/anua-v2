import { BaseModelDto } from '@adocasts.com/dto/base'
import type Timesheet from '#models/timesheet'
import type { TimesheetStatus } from '#models/timesheet'
import type { DateTime } from 'luxon'

export default class TimesheetDto extends BaseModelDto {
  declare id: string
  declare schoolId: string
  declare name: string
  declare month: number
  declare year: number
  declare status: TimesheetStatus
  declare closedAt: DateTime | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: Timesheet) {
    super()

    if (!model) return

    this.id = model.id
    this.schoolId = model.schoolId
    this.name = model.name
    this.month = model.month
    this.year = model.year
    this.status = model.status
    this.closedAt = model.closedAt
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
