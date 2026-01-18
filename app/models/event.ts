import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import School from './school.js'
import EventParticipant from './event_participant.js'

export type EventType =
  | 'ACADEMIC'
  | 'SOCIAL'
  | 'SPORTS'
  | 'CULTURAL'
  | 'FIELD_TRIP'
  | 'MEETING'
  | 'GRADUATION'
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
export type EventVisibility = 'PUBLIC' | 'SCHOOL_ONLY' | 'CLASS_ONLY' | 'INVITE_ONLY'

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare location: string | null

  @column()
  declare type: EventType

  @column()
  declare status: EventStatus

  @column()
  declare visibility: EventVisibility

  @column()
  declare maxParticipants: number | null

  @column()
  declare requiresParentalConsent: boolean

  @column()
  declare hasAdditionalCosts: boolean

  @column()
  declare additionalCostAmount: number | null

  @column()
  declare additionalCostDescription: string | null

  @column.dateTime()
  declare startsAt: DateTime

  @column.dateTime()
  declare endsAt: DateTime | null

  @column()
  declare organizerId: string

  @column()
  declare schoolId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => User, { foreignKey: 'organizerId' })
  declare organizer: BelongsTo<typeof User>

  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @hasMany(() => EventParticipant)
  declare participants: HasMany<typeof EventParticipant>
}
