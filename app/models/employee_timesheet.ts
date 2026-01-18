import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Timesheet from './timesheet.js'
import User from './user.js'
import TimesheetEntry from './timesheet_entry.js'

export type EmployeeTimesheetStatus = 'OPEN' | 'CLOSED'

export default class EmployeeTimesheet extends BaseModel {
  @beforeCreate()
  static assignId(employeeTimesheet: EmployeeTimesheet) {
    if (!employeeTimesheet.id) {
      employeeTimesheet.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare timesheetId: string

  @column()
  declare userId: string

  @column()
  declare status: EmployeeTimesheetStatus

  @column.dateTime()
  declare closedAt: DateTime | null

  @column()
  declare observations: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Timesheet)
  declare timesheet: BelongsTo<typeof Timesheet>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => TimesheetEntry)
  declare entries: HasMany<typeof TimesheetEntry>
}
