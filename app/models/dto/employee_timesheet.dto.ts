import { BaseModelDto } from '@adocasts.com/dto/base'
import type EmployeeTimesheet from '#models/employee_timesheet'
import type { EmployeeTimesheetStatus } from '#models/employee_timesheet'
import type { DateTime } from 'luxon'

export default class EmployeeTimesheetDto extends BaseModelDto {
  declare id: string
  declare timesheetId: string
  declare userId: string
  declare status: EmployeeTimesheetStatus
  declare closedAt: DateTime | null
  declare observations: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: EmployeeTimesheet) {
    super()

    if (!model) return

    this.id = model.id
    this.timesheetId = model.timesheetId
    this.userId = model.userId
    this.status = model.status
    this.closedAt = model.closedAt
    this.observations = model.observations
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
