import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import CalendarSlot from './calendar_slot.js'

export default class CalendarSlotContent extends BaseModel {
  static table = 'CalendarSlotContent'

  @beforeCreate()
  static assignId(model: CalendarSlotContent) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare content: string

  @column()
  declare calendarSlotId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => CalendarSlot, { foreignKey: 'calendarSlotId' })
  declare calendarSlot: BelongsTo<typeof CalendarSlot>
}
