import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Teacher from './teacher.js'
import Class_ from './class.js'
import Subject from './subject.js'
import CalendarSlot from './calendar_slot.js'

export default class TeacherHasClass extends BaseModel {
  static table = 'TeacherHasClass'

  @beforeCreate()
  static assignId(teacherHasClass: TeacherHasClass) {
    if (!teacherHasClass.id) {
      teacherHasClass.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'teacherId' })
  declare teacherId: string

  @column({ columnName: 'classId' })
  declare classId: string

  @column({ columnName: 'subjectId' })
  declare subjectId: string

  @column({ columnName: 'subjectQuantity' })
  declare subjectQuantity: number

  @column({ columnName: 'classWeekDay' })
  declare classWeekDay: string | null

  @column({ columnName: 'startTime' })
  declare startTime: string | null

  @column({ columnName: 'endTime' })
  declare endTime: string | null

  @column({ columnName: 'teacherAvailabilityId' })
  declare teacherAvailabilityId: string | null

  @column({ columnName: 'isActive' })
  declare isActive: boolean

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Teacher, { foreignKey: 'teacherId' })
  declare teacher: BelongsTo<typeof Teacher>

  @belongsTo(() => Class_, { foreignKey: 'classId' })
  declare class: BelongsTo<typeof Class_>

  @belongsTo(() => Subject, { foreignKey: 'subjectId' })
  declare subject: BelongsTo<typeof Subject>

  @hasMany(() => CalendarSlot, { foreignKey: 'teacherHasClassId' })
  declare calendarSlots: HasMany<typeof CalendarSlot>
}
