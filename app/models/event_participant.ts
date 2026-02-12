import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Event from './event.js'
import User from './user.js'

export default class EventParticipant extends BaseModel {
  static table = 'EventParticipant'

  @beforeCreate()
  static assignId(model: EventParticipant) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'eventId' })
  declare eventId: string

  @column({ columnName: 'userId' })
  declare userId: string

  @column.dateTime({ columnName: 'registrationDate' })
  declare registrationDate: DateTime

  @column()
  declare status: string

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Event, { foreignKey: 'eventId' })
  declare event: BelongsTo<typeof Event>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
