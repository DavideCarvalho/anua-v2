import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Event from './event.js'

export default class EventAttachment extends BaseModel {
  static table = 'EventAttachment'

  @beforeCreate()
  static assignId(model: EventAttachment) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare eventId: string

  @column()
  declare fileName: string

  @column()
  declare originalName: string

  @column()
  declare mimeType: string

  @column()
  declare size: number

  @column()
  declare url: string

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Event, { foreignKey: 'eventId' })
  declare event: BelongsTo<typeof Event>
}
