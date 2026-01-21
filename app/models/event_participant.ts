import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Event from './event.js'
import User from './user.js'

export default class EventParticipant extends BaseModel {
  static table = 'EventParticipant'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare eventId: string

  @column()
  declare userId: string

  @column.dateTime()
  declare registrationDate: DateTime

  @column()
  declare status: string

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Event, { foreignKey: 'eventId' })
  declare event: BelongsTo<typeof Event>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
