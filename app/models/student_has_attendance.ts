import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import Attendance from './attendance.js'
import User from './user.js'
import AttendanceEdit from './attendance_edit.js'
import AttendanceAttachment from './attendance_attachment.js'

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED'

export default class StudentHasAttendance extends BaseModel {
  static table = 'StudentHasAttendance'

  @beforeCreate()
  static assignId(model: StudentHasAttendance) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare attendanceId: string

  @column()
  declare status: AttendanceStatus

  @column()
  declare justification: string | null

  @column()
  declare lastEditedById: string | null

  @column.dateTime()
  declare lastEditedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => Attendance, { foreignKey: 'attendanceId' })
  declare attendance: BelongsTo<typeof Attendance>

  @belongsTo(() => User, { foreignKey: 'lastEditedById' })
  declare lastEditedBy: BelongsTo<typeof User>

  @hasMany(() => AttendanceEdit, { foreignKey: 'studentHasAttendanceId' })
  declare edits: HasMany<typeof AttendanceEdit>

  @hasMany(() => AttendanceAttachment, { foreignKey: 'studentHasAttendanceId' })
  declare attachments: HasMany<typeof AttendanceAttachment>
}
