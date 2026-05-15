import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StudentHasAttendance, { type AttendanceStatus } from './student_has_attendance.js'
import User from './user.js'

export default class AttendanceEdit extends BaseModel {
  static table = 'AttendanceEdit'

  @beforeCreate()
  static assignId(model: AttendanceEdit) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentHasAttendanceId: string

  @column()
  declare previousStatus: AttendanceStatus | null

  @column()
  declare previousJustification: string | null

  @column()
  declare newStatus: AttendanceStatus

  @column()
  declare newJustification: string | null

  @column()
  declare reason: string | null

  @column()
  declare editedById: string | null

  @column.dateTime({ autoCreate: true })
  declare editedAt: DateTime

  @belongsTo(() => StudentHasAttendance, { foreignKey: 'studentHasAttendanceId' })
  declare studentHasAttendance: BelongsTo<typeof StudentHasAttendance>

  @belongsTo(() => User, { foreignKey: 'editedById' })
  declare editedBy: BelongsTo<typeof User>
}
