import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Event from './event.js'
import User from './user.js'

export type ParticipationStatus = 'INVITED' | 'CONFIRMED' | 'DECLINED' | 'ATTENDED' | 'ABSENT'

export default class EventParticipant extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare status: ParticipationStatus

  @column()
  declare parentalConsent: boolean

  @column()
  declare parentalConsentGivenAt: DateTime | null

  @column()
  declare eventId: string

  @column()
  declare participantId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => Event)
  declare event: BelongsTo<typeof Event>

  @belongsTo(() => User, { foreignKey: 'participantId' })
  declare participant: BelongsTo<typeof User>
}
