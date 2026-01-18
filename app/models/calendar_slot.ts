import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Calendar from './calendar.js'
import ClassSchedule from './class_schedule.js'

export type SlotType = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'CUSTOM'
export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

export default class CalendarSlot extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare dayOfWeek: DayOfWeek

  @column()
  declare type: SlotType

  @column()
  declare startTime: string // HH:MM format

  @column()
  declare endTime: string // HH:MM format

  @column()
  declare order: number

  @column()
  declare calendarId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => Calendar)
  declare calendar: BelongsTo<typeof Calendar>

  @hasMany(() => ClassSchedule)
  declare classSchedules: HasMany<typeof ClassSchedule>
}
