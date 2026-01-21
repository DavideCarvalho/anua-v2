import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Event from './event.js'

export default class EventRecurrence extends BaseModel {
  static table = 'EventRecurrence'

  @beforeCreate()
  static assignId(model: EventRecurrence) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare eventId: string

  @column()
  declare pattern: string

  @column()
  declare interval: number

  @column()
  declare daysOfWeek: number[] | null

  @column()
  declare dayOfMonth: number | null

  @column.dateTime()
  declare endDate: DateTime | null

  @column()
  declare occurrences: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Event, { foreignKey: 'eventId' })
  declare event: BelongsTo<typeof Event>
}
