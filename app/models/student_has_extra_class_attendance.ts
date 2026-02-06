import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import ExtraClassAttendance from './extra_class_attendance.js'
export type ExtraClassAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED'

export default class StudentHasExtraClassAttendance extends BaseModel {
  static table = 'StudentHasExtraClassAttendance'

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string
  @column({ columnName: 'studentId' })
  declare studentId: string
  @column({ columnName: 'extraClassAttendanceId' })
  declare extraClassAttendanceId: string
  @column({ columnName: 'status' })
  declare status: ExtraClassAttendanceStatus
  @column({ columnName: 'justification' })
  declare justification: string | null
  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>
  @belongsTo(() => ExtraClassAttendance, { foreignKey: 'extraClassAttendanceId' })
  declare extraClassAttendance: BelongsTo<typeof ExtraClassAttendance>

  @beforeCreate()
  static assignId(model: StudentHasExtraClassAttendance) {
    if (!model.id) model.id = uuidv7()
  }
}
