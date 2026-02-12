import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { v7 as uuidv7 } from 'uuid'
import Event from './event.js'
import EventParentalConsent from './event_parental_consent.js'
import Student from './student.js'
import StudentPayment from './student_payment.js'
import User from './user.js'

export default class EventStudentPayment extends BaseModel {
  static table = 'EventStudentPayment'

  @beforeCreate()
  static assignId(model: EventStudentPayment) {
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
  declare responsibleId: string | null

  @column({ columnName: 'eventParentalConsentId' })
  declare eventParentalConsentId: string | null

  @column({ columnName: 'studentPaymentId' })
  declare studentPaymentId: string

  @column()
  declare status: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => Event, { foreignKey: 'eventId' })
  declare event: BelongsTo<typeof Event>

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'responsibleId' })
  declare responsible: BelongsTo<typeof User>

  @belongsTo(() => EventParentalConsent, { foreignKey: 'eventParentalConsentId' })
  declare parentalConsent: BelongsTo<typeof EventParentalConsent>

  @belongsTo(() => StudentPayment, { foreignKey: 'studentPaymentId' })
  declare studentPayment: BelongsTo<typeof StudentPayment>
}
