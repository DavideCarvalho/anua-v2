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
import StudentAddress from './student_address.js'
import StudentMedicalInfo from './student_medical_info.js'
import StudentEmergencyContact from './student_emergency_contact.js'
import Occurrence from './occurrence.js'

export type EnrollmentStatus = 'PENDING_DOCUMENT_REVIEW' | 'REGISTERED'

export default class Student extends BaseModel {
  static table = 'Student'

  // Same ID as User (1:1 relationship)
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare descountPercentage: number // Note: typo in DB schema

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
  declare enrollmentStatus: EnrollmentStatus

  // Relationships
  @belongsTo(() => User, { foreignKey: 'id' })
  declare user: BelongsTo<typeof User>

  @hasMany(() => StudentDocument, { foreignKey: 'studentId' })
  declare documents: HasMany<typeof StudentDocument>

  @hasMany(() => StudentBalanceTransaction, { foreignKey: 'studentId' })
  declare balanceTransactions: HasMany<typeof StudentBalanceTransaction>

  @hasMany(() => StudentPayment, { foreignKey: 'studentId' })
  declare payments: HasMany<typeof StudentPayment>

  @hasMany(() => StudentHasResponsible, { foreignKey: 'studentId' })
  declare responsibles: HasMany<typeof StudentHasResponsible>

  @belongsTo(() => Class, { foreignKey: 'classId' })
  declare class: BelongsTo<typeof Class>

  @hasOne(() => StudentGamification, { foreignKey: 'studentId' })
  declare gamification: HasOne<typeof StudentGamification>

  @hasMany(() => StudentHasLevel, { foreignKey: 'studentId' })
  declare levels: HasMany<typeof StudentHasLevel>

  @hasOne(() => StudentAddress, { foreignKey: 'studentId' })
  declare address: HasOne<typeof StudentAddress>

  @hasOne(() => StudentMedicalInfo, { foreignKey: 'studentId' })
  declare medicalInfo: HasOne<typeof StudentMedicalInfo>

  @hasMany(() => StudentEmergencyContact, { foreignKey: 'studentId' })
  declare emergencyContacts: HasMany<typeof StudentEmergencyContact>

  @hasMany(() => Occurrence, { foreignKey: 'studentId' })
  declare occurrences: HasMany<typeof Occurrence>
}
