import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import School from './school.js'
import EventParticipant from './event_participant.js'
import EventParentalConsent from './event_parental_consent.js'
import EventStudentPayment from './event_student_payment.js'
import EventAudience from './event_audience.js'

export type EventType =
  | 'ACADEMIC_EVENT'
  | 'EXAM'
  | 'ASSIGNMENT'
  | 'FIELD_TRIP'
  | 'PARENTS_MEETING'
  | 'SCHOOL_CONFERENCE'
  | 'CULTURAL_EVENT'
  | 'SPORTS_EVENT'
  | 'ARTS_SHOW'
  | 'SCIENCE_FAIR'
  | 'TALENT_SHOW'
  | 'COMMUNITY_EVENT'
  | 'FUNDRAISING'
  | 'VOLUNTEER_DAY'
  | 'SCHOOL_PARTY'
  | 'STAFF_MEETING'
  | 'TRAINING'
  | 'SCHOOL_BOARD'
  | 'HEALTH_CHECK'
  | 'VACCINATION_DAY'
  | 'MENTAL_HEALTH'
  | 'OTHER'
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' | 'POSTPONED'
export type EventVisibility =
  | 'PUBLIC'
  | 'INTERNAL'
  | 'STAFF_ONLY'
  | 'PARENTS_ONLY'
  | 'STUDENTS_ONLY'
  | 'SPECIFIC_CLASSES'
  | 'SPECIFIC_LEVELS'
export type EventPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

export default class Event extends BaseModel {
  static table = 'Event'

  @beforeCreate()
  static assignId(model: Event) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column({ columnName: 'shortDescription' })
  declare shortDescription: string | null

  @column()
  declare type: EventType

  @column()
  declare status: EventStatus

  @column()
  declare visibility: EventVisibility

  @column()
  declare priority: EventPriority

  @column.dateTime({ columnName: 'startDate' })
  declare startDate: DateTime

  @column.dateTime({ columnName: 'endDate' })
  declare endDate: DateTime | null

  @column({ columnName: 'startTime' })
  declare startTime: string | null

  @column({ columnName: 'endTime' })
  declare endTime: string | null

  @column({ columnName: 'isAllDay' })
  declare isAllDay: boolean

  @column()
  declare location: string | null

  @column({ columnName: 'locationDetails' })
  declare locationDetails: string | null

  @column({ columnName: 'isOnline' })
  declare isOnline: boolean

  @column({ columnName: 'onlineUrl' })
  declare onlineUrl: string | null

  @column({ columnName: 'isExternal' })
  declare isExternal: boolean

  @column({ columnName: 'organizerId' })
  declare organizerId: string | null

  @column({ columnName: 'maxParticipants' })
  declare maxParticipants: number | null

  @column({ columnName: 'currentParticipants' })
  declare currentParticipants: number

  @column({ columnName: 'requiresRegistration' })
  declare requiresRegistration: boolean

  @column.dateTime({ columnName: 'registrationDeadline' })
  declare registrationDeadline: DateTime | null

  @column({ columnName: 'requiresParentalConsent' })
  declare requiresParentalConsent: boolean

  @column({ columnName: 'hasAdditionalCosts' })
  declare hasAdditionalCosts: boolean

  @column({ columnName: 'additionalCostAmount' })
  declare additionalCostAmount: number | null

  @column({ columnName: 'additionalCostInstallments' })
  declare additionalCostInstallments: number | null

  @column({ columnName: 'additionalCostDescription' })
  declare additionalCostDescription: string | null

  @column({ columnName: 'allowComments' })
  declare allowComments: boolean

  @column({ columnName: 'sendNotifications' })
  declare sendNotifications: boolean

  @column({ columnName: 'isRecurring' })
  declare isRecurring: boolean

  @column({ columnName: 'recurringPattern' })
  declare recurringPattern: Record<string, unknown> | null

  @column({ columnName: 'bannerUrl' })
  declare bannerUrl: string | null

  @column()
  declare attachments: Record<string, unknown>[] | null

  @column()
  declare tags: string[] | null

  @column()
  declare metadata: Record<string, unknown> | null

  @column({ columnName: 'schoolId' })
  declare schoolId: string

  @column({ columnName: 'createdBy' })
  declare createdBy: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
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

  @hasMany(() => EventStudentPayment, { foreignKey: 'eventId' })
  declare eventPayments: HasMany<typeof EventStudentPayment>

  @hasMany(() => EventAudience, { foreignKey: 'eventId' })
  declare eventAudiences: HasMany<typeof EventAudience>
}
