import { BaseModelDto } from '@adocasts.com/dto/base'
import type EmployeeTimesheet from '#models/employee_timesheet'
import type { EmployeeTimesheetStatus } from '#models/employee_timesheet'
import type { DateTime } from 'luxon'

export default class EmployeeTimesheetDto extends BaseModelDto {
  declare id: string
  declare timesheetId: string
  declare userId: string
  declare status: EmployeeTimesheetStatus
  declare closedAt: Date | null
  declare observations: string | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: EmployeeTimesheet) {
    super()

    if (!model) return

    this.id = model.id
    this.timesheetId = model.timesheetId
    this.userId = model.userId
    this.status = model.status
    this.closedAt = model.closedAt?.toJSDate() ?? null
    this.observations = model.observations
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
