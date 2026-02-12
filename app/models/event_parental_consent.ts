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

  @column({ columnName: 'eventId' })
  declare eventId: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'responsibleId' })
  declare responsibleId: string

  @column()
  declare status: ParentalConsentStatus

  @column.dateTime({ columnName: 'respondedAt' })
  declare respondedAt: DateTime | null

  @column.dateTime({ columnName: 'expiresAt' })
  declare expiresAt: DateTime | null

  @column({ columnName: 'approvalNotes' })
  declare approvalNotes: string | null

  @column({ columnName: 'denialReason' })
  declare denialReason: string | null

  @column()
  declare signature: string | null

  @column({ columnName: 'ipAddress' })
  declare ipAddress: string | null

  @column.dateTime({ columnName: 'emailSentAt' })
  declare emailSentAt: DateTime | null

  @column.dateTime({ columnName: 'reminderSentAt' })
  declare reminderSentAt: DateTime | null

  @column({ columnName: 'reminderCount' })
  declare reminderCount: number

  @column()
  declare metadata: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Event, { foreignKey: 'eventId' })
  declare event: BelongsTo<typeof Event>

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'responsibleId' })
  declare responsible: BelongsTo<typeof User>
}
