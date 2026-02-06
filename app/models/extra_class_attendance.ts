import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import ExtraClass from './extra_class.js'
import ExtraClassSchedule from './extra_class_schedule.js'
import StudentHasExtraClassAttendance from './student_has_extra_class_attendance.js'

export default class ExtraClassAttendance extends BaseModel {
  static table = 'ExtraClassAttendance'

  @beforeCreate()
  static assignId(model: ExtraClassAttendance) {
    if (!model.id) model.id = uuidv7()
  }

  @column({ isPrimary: true, columnName: 'id' }) declare id: string
  @column({ columnName: 'extraClassId' }) declare extraClassId: string
  @column({ columnName: 'extraClassScheduleId' }) declare extraClassScheduleId: string
  @column.dateTime({ columnName: 'date' }) declare date: DateTime
  @column({ columnName: 'note' }) declare note: string | null
  @column.dateTime({ autoCreate: true, columnName: 'createdAt' }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => ExtraClass, { foreignKey: 'extraClassId' }) declare extraClass: BelongsTo<
    typeof ExtraClass
  >
  @belongsTo(() => ExtraClassSchedule, { foreignKey: 'extraClassScheduleId' })
  declare extraClassSchedule: BelongsTo<typeof ExtraClassSchedule>
  @hasMany(() => StudentHasExtraClassAttendance, { foreignKey: 'extraClassAttendanceId' })
  declare studentAttendances: HasMany<typeof StudentHasExtraClassAttendance>
}
