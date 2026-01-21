import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ClassSchedule from './class_schedule.js'
import Teacher from './teacher.js'
import Class from './class.js'
import Subject from './subject.js'

export default class FixedClass extends BaseModel {
  static table = 'FixedClass'

  @beforeCreate()
  static assignId(model: FixedClass) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare classScheduleId: string

  @column()
  declare teacherId: string

  @column()
  declare classId: string

  @column()
  declare subjectId: string

  @column()
  declare subjectQuantity: number

  @column()
  declare classWeekDay: string

  @column()
  declare startTime: string

  @column()
  declare endTime: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ClassSchedule, { foreignKey: 'classScheduleId' })
  declare classSchedule: BelongsTo<typeof ClassSchedule>

  @belongsTo(() => Teacher, { foreignKey: 'teacherId' })
  declare teacher: BelongsTo<typeof Teacher>

  @belongsTo(() => Class, { foreignKey: 'classId' })
  declare class: BelongsTo<typeof Class>

  @belongsTo(() => Subject, { foreignKey: 'subjectId' })
  declare subject: BelongsTo<typeof Subject>
}
