import { BaseModelDto } from '@adocasts.com/dto/base'
import type TimesheetEntry from '#models/timesheet_entry'
import type { DateTime } from 'luxon'

export default class TimesheetEntryDto extends BaseModelDto {
  declare id: string
  declare employeeTimesheetId: string
  declare date: DateTime
  declare worked: boolean
  declare entryTime: string | null
  declare exitTime: string | null
  declare observations: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: TimesheetEntry) {
    super()

    if (!model) return

    this.id = model.id
    this.employeeTimesheetId = model.employeeTimesheetId
    this.date = model.date
    this.worked = model.worked
    this.entryTime = model.entryTime
    this.exitTime = model.exitTime
    this.observations = model.observations
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
