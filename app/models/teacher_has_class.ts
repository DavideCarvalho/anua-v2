import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Teacher from './teacher.js'
import Class_ from './class.js'
import Subject from './subject.js'
import CalendarSlot from './calendar_slot.js'

export default class TeacherHasClass extends BaseModel {
  static table = 'TeacherHasClass'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare teacherId: string

  @column()
  declare classId: string

  @column()
  declare subjectId: string

  @column()
  declare subjectQuantity: number

  @column()
  declare classWeekDay: string | null

  @column()
  declare startTime: string | null

  @column()
  declare endTime: string | null

  @column()
  declare teacherAvailabilityId: string | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
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
