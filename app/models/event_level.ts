import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Event from './event.js'
import Level from './level.js'

export default class EventLevel extends BaseModel {
  static table = 'EventLevel'

  @beforeCreate()
  static assignId(model: EventLevel) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare eventId: string

  @column()
  declare levelId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Event, { foreignKey: 'eventId' })
  declare event: BelongsTo<typeof Event>

  @belongsTo(() => Level, { foreignKey: 'levelId' })
  declare level: BelongsTo<typeof Level>
}
