import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import TimesheetEntry from './timesheet_entry.js'
import TeacherAbsence from './teacher_absence.js'

export type AbsenceReason =
  | 'SICKNESS'
  | 'PERSONAL_MATTERS'
  | 'BLOOD_DONATION'
  | 'ELECTION_JUDGE'
  | 'VACATION'
  | 'DAYOFF'
  | 'OTHER'

export type AbsenceStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export default class Absence extends BaseModel {
  @beforeCreate()
  static assignId(absence: Absence) {
    if (!absence.id) {
      absence.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column.date()
  declare date: DateTime

  @column()
  declare reason: AbsenceReason

  @column()
  declare status: AbsenceStatus

  @column()
  declare description: string | null

  @column()
  declare rejectionReason: string | null

  @column()
  declare isExcused: boolean

  @column()
  declare timesheetEntryId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => TimesheetEntry)
  declare timesheetEntry: BelongsTo<typeof TimesheetEntry>

  @hasOne(() => TeacherAbsence)
  declare teacherAbsence: HasOne<typeof TeacherAbsence>
}
