import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import CalendarSlot from './calendar_slot.js'

export default class Attendance extends BaseModel {
  static table = 'Attendance'

  @beforeCreate()
  static assignId(model: Attendance) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare note: string | null

  @column.dateTime()
  declare date: DateTime

  @column()
  declare calendarSlotId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => CalendarSlot, { foreignKey: 'calendarSlotId' })
  declare calendarSlot: BelongsTo<typeof CalendarSlot>
}
