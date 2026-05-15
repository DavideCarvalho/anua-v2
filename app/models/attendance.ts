import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import CalendarSlot from './calendar_slot.js'
import User from './user.js'

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

  @column()
  declare createdById: string | null

  @column()
  declare lastEditedById: string | null

  @column.dateTime()
  declare lastEditedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => CalendarSlot, { foreignKey: 'calendarSlotId' })
  declare calendarSlot: BelongsTo<typeof CalendarSlot>

  @belongsTo(() => User, { foreignKey: 'createdById' })
  declare createdBy: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'lastEditedById' })
  declare lastEditedBy: BelongsTo<typeof User>
}
