import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import CalendarSlot from './calendar_slot.js'

export type CalendarStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT'

export default class Calendar extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare status: CalendarStatus

  @column.date()
  declare startDate: DateTime

  @column.date()
  declare endDate: DateTime

  @column()
  declare schoolId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @hasMany(() => CalendarSlot)
  declare slots: HasMany<typeof CalendarSlot>
}
