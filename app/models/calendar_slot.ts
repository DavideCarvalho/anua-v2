import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Calendar from './calendar.js'
import TeacherHasClass from './teacher_has_class.js'

export default class CalendarSlot extends BaseModel {
  static table = 'CalendarSlot'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare teacherHasClassId: string | null

  @column()
  declare classWeekDay: number // 0 = Sunday, 1 = Monday, etc.

  @column()
  declare startTime: string // time format from DB

  @column()
  declare endTime: string // time format from DB

  @column()
  declare minutes: number

  @column()
  declare calendarId: string

  @column()
  declare isBreak: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Calendar, { foreignKey: 'calendarId' })
  declare calendar: BelongsTo<typeof Calendar>

  @belongsTo(() => TeacherHasClass, { foreignKey: 'teacherHasClassId' })
  declare teacherHasClass: BelongsTo<typeof TeacherHasClass>
}
