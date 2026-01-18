import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Class_ from './class.js'
import Subject from './subject.js'
import Teacher from './teacher.js'
import CalendarSlot from './calendar_slot.js'

export default class ClassSchedule extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column.date()
  declare date: DateTime

  @column()
  declare classId: string

  @column()
  declare subjectId: string

  @column()
  declare teacherId: string | null

  @column()
  declare calendarSlotId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => Class_)
  declare class: BelongsTo<typeof Class_>

  @belongsTo(() => Subject)
  declare subject: BelongsTo<typeof Subject>

  @belongsTo(() => Teacher)
  declare teacher: BelongsTo<typeof Teacher>

  @belongsTo(() => CalendarSlot)
  declare calendarSlot: BelongsTo<typeof CalendarSlot>
}
