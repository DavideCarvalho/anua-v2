import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import ExtraClass from './extra_class.js'
import ExtraClassAttendance from './extra_class_attendance.js'

export default class ExtraClassSchedule extends BaseModel {
  static table = 'ExtraClassSchedule'

  @beforeCreate()
  static assignId(model: ExtraClassSchedule) {
    if (!model.id) model.id = uuidv7()
  }

  @column({ isPrimary: true, columnName: 'id' }) declare id: string
  @column({ columnName: 'extraClassId' }) declare extraClassId: string
  @column({ columnName: 'weekDay' }) declare weekDay: number
  @column({ columnName: 'startTime' }) declare startTime: string
  @column({ columnName: 'endTime' }) declare endTime: string
  @column.dateTime({ autoCreate: true, columnName: 'createdAt' }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => ExtraClass, { foreignKey: 'extraClassId' }) declare extraClass: BelongsTo<
    typeof ExtraClass
  >
  @hasMany(() => ExtraClassAttendance, { foreignKey: 'extraClassScheduleId' })
  declare attendances: HasMany<typeof ExtraClassAttendance>
}
