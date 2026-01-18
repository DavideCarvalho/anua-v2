import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import EmployeeTimesheet from './employee_timesheet.js'
import Absence from './absence.js'

export default class TimesheetEntry extends BaseModel {
  @beforeCreate()
  static assignId(entry: TimesheetEntry) {
    if (!entry.id) {
      entry.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare employeeTimesheetId: string

  @column.date()
  declare date: DateTime

  @column()
  declare worked: boolean

  @column()
  declare entryTime: string | null

  @column()
  declare exitTime: string | null

  @column()
  declare observations: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => EmployeeTimesheet)
  declare employeeTimesheet: BelongsTo<typeof EmployeeTimesheet>

  @hasOne(() => Absence)
  declare absence: HasOne<typeof Absence>
}
