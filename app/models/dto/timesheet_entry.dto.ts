import { BaseModelDto } from '@adocasts.com/dto/base'
import type TimesheetEntry from '#models/timesheet_entry'

export default class TimesheetEntryDto extends BaseModelDto {
  declare id: string
  declare employeeTimesheetId: string
  declare date: Date
  declare worked: boolean
  declare entryTime: string | null
  declare exitTime: string | null
  declare observations: string | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: TimesheetEntry) {
    super()

    if (!model) return

    this.id = model.id
    this.employeeTimesheetId = model.employeeTimesheetId
    this.date = model.date.toJSDate()
    this.worked = model.worked
    this.entryTime = model.entryTime
    this.exitTime = model.exitTime
    this.observations = model.observations
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
