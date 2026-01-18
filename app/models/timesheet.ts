import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import EmployeeTimesheet from './employee_timesheet.js'

export type TimesheetStatus = 'OPEN' | 'CLOSED'

export default class Timesheet extends BaseModel {
  @beforeCreate()
  static assignId(timesheet: Timesheet) {
    if (!timesheet.id) {
      timesheet.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare schoolId: string

  @column()
  declare name: string

  @column()
  declare month: number

  @column()
  declare year: number

  @column()
  declare status: TimesheetStatus

  @column.dateTime()
  declare closedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @hasMany(() => EmployeeTimesheet)
  declare employeeTimesheets: HasMany<typeof EmployeeTimesheet>
}
