import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import StudentDocument from './student_document.js'
import StudentBalanceTransaction from './student_balance_transaction.js'
import StudentPayment from './student_payment.js'
import StudentHasResponsible from './student_has_responsible.js'
import Class from './class.js'
import StudentGamification from './student_gamification.js'
import StudentHasLevel from './student_has_level.js'

export default class Student extends BaseModel {
  // Same ID as User (1:1 relationship)
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare discountPercentage: number

  @column()
  declare monthlyPaymentAmount: number

  @column()
  declare isSelfResponsible: boolean

  @column()
  declare paymentDate: number | null

  @column()
  declare classId: string | null

  @column()
  declare contractId: string | null

  @column()
  declare canteenLimit: number | null

  @column()
  declare balance: number

  @column()
  declare enrollmentStatus: 'PENDING_DOCUMENT_REVIEW' | 'REGISTERED'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User, { foreignKey: 'id' })
  declare user: BelongsTo<typeof User>

  @hasMany(() => StudentDocument)
  declare documents: HasMany<typeof StudentDocument>

  @hasMany(() => StudentBalanceTransaction)
  declare balanceTransactions: HasMany<typeof StudentBalanceTransaction>

  @hasMany(() => StudentPayment)
  declare payments: HasMany<typeof StudentPayment>

  @hasMany(() => StudentHasResponsible)
  declare responsibles: HasMany<typeof StudentHasResponsible>

  @belongsTo(() => Class)
  declare class: BelongsTo<typeof Class>

  @hasOne(() => StudentGamification)
  declare gamification: HasOne<typeof StudentGamification>

  @hasMany(() => StudentHasLevel)
  declare levels: HasMany<typeof StudentHasLevel>
}
