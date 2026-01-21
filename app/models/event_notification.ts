import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Event from './event.js'

export default class EventNotification extends BaseModel {
  static table = 'EventNotification'

  @beforeCreate()
  static assignId(model: EventNotification) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare eventId: string

  @column()
  declare userId: string

  @column()
  declare type: string

  @column()
  declare title: string

  @column()
  declare message: string

  @column.dateTime()
  declare scheduledFor: DateTime | null

  @column()
  declare isSent: boolean

  @column()
  declare sentVia: string[] | null

  @column.dateTime()
  declare sentAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Event, { foreignKey: 'eventId' })
  declare event: BelongsTo<typeof Event>
}
