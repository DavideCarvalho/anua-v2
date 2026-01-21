import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import School from './school.js'
import EventParticipant from './event_participant.js'
import EventParentalConsent from './event_parental_consent.js'

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
export type EventPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

export default class Event extends BaseModel {
  static table = 'Event'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare shortDescription: string | null

  @column()
  declare type: EventType

  @column()
  declare status: EventStatus

  @column()
  declare visibility: EventVisibility

  @column()
  declare priority: EventPriority

  @column.dateTime()
  declare startDate: DateTime

  @column.dateTime()
  declare endDate: DateTime | null

  @column()
  declare startTime: string | null

  @column()
  declare endTime: string | null

  @column()
  declare isAllDay: boolean

  @column()
  declare location: string | null

  @column()
  declare locationDetails: string | null

  @column()
  declare isOnline: boolean

  @column()
  declare onlineUrl: string | null

  @column()
  declare isExternal: boolean

  @column()
  declare organizerId: string | null

  @column()
  declare maxParticipants: number | null

  @column()
  declare currentParticipants: number

  @column()
  declare requiresRegistration: boolean

  @column.dateTime()
  declare registrationDeadline: DateTime | null

  @column()
  declare requiresParentalConsent: boolean

  @column()
  declare allowComments: boolean

  @column()
  declare sendNotifications: boolean

  @column()
  declare isRecurring: boolean

  @column()
  declare recurringPattern: Record<string, unknown> | null

  @column()
  declare bannerUrl: string | null

  @column()
  declare attachments: Record<string, unknown>[] | null

  @column()
  declare tags: string[] | null

  @column()
  declare metadata: Record<string, unknown> | null

  @column()
  declare schoolId: string

  @column()
  declare createdBy: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User, { foreignKey: 'organizerId' })
  declare organizer: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @hasMany(() => EventParticipant, { foreignKey: 'eventId' })
  declare participants: HasMany<typeof EventParticipant>

  @hasMany(() => EventParentalConsent, { foreignKey: 'eventId' })
  declare parentalConsents: HasMany<typeof EventParentalConsent>
}
