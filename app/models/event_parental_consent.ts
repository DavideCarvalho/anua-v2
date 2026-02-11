import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Event from './event.js'
import Student from './student.js'
import User from './user.js'

export type ParentalConsentStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED'

export default class EventParentalConsent extends BaseModel {
  static table = 'EventParentalConsent'

  @beforeCreate()
  static assignId(model: EventParentalConsent) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare eventId: string

  @column()
  declare studentId: string

  @column()
  declare responsibleId: string

  @column()
  declare status: ParentalConsentStatus

  @column.dateTime()
  declare respondedAt: DateTime | null

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column()
  declare approvalNotes: string | null

  @column()
  declare denialReason: string | null

  @column()
  declare signature: string | null

  @column()
  declare ipAddress: string | null

  @column.dateTime()
  declare emailSentAt: DateTime | null

  @column.dateTime()
  declare reminderSentAt: DateTime | null

  @column()
  declare reminderCount: number

  @column()
  declare metadata: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Event, { foreignKey: 'eventId' })
  declare event: BelongsTo<typeof Event>

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'responsibleId' })
  declare responsible: BelongsTo<typeof User>
}
