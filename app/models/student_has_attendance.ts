import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import Attendance from './attendance.js'

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'

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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => Attendance, { foreignKey: 'attendanceId' })
  declare attendance: BelongsTo<typeof Attendance>
}
