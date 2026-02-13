import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasOne, beforeCreate } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import { Auditable } from '@stouder-io/adonis-auditing'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import Contract from './contract.js'
import Invoice from './invoice.js'
import InsuranceBilling from './insurance_billing.js'
import InsuranceClaim from './insurance_claim.js'
import StudentHasExtraClass from './student_has_extra_class.js'

export default class StudentPayment extends compose(BaseModel, Auditable) {
  static table = 'StudentPayment'

  @beforeCreate()
  static assignId(model: StudentPayment) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'amount' })
  declare amount: number

  @column({ columnName: 'month' })
  declare month: number

  @column({ columnName: 'year' })
  declare year: number

  @column({ columnName: 'type' })
  declare type:
    | 'ENROLLMENT'
    | 'TUITION'
    | 'CANTEEN'
    | 'COURSE'
    | 'AGREEMENT'
    | 'STUDENT_LOAN'
    | 'STORE'
    | 'EXTRA_CLASS'
    | 'OTHER'

  @column({ columnName: 'status' })
  declare status:
    | 'NOT_PAID'
    | 'PENDING'
    | 'PAID'
    | 'OVERDUE'
    | 'CANCELLED'
    | 'FAILED'
    | 'RENEGOTIATED'

  @column({ columnName: 'totalAmount' })
  declare totalAmount: number

  @column.date({ columnName: 'dueDate' })
  declare dueDate: DateTime

  @column({ columnName: 'installments' })
  declare installments: number

  @column({ columnName: 'installmentNumber' })
  declare installmentNumber: number

  @column({ columnName: 'discountPercentage' })
  declare discountPercentage: number

  @column({ columnName: 'discountType' })
  declare discountType: 'PERCENTAGE' | 'FLAT'

  @column({ columnName: 'discountValue' })
  declare discountValue: number

  @column.date({ columnName: 'paidAt' })
  declare paidAt: DateTime | null

  @column.dateTime({ columnName: 'emailSentAt' })
  declare emailSentAt: DateTime | null

  @column({ columnName: 'contractId' })
  declare contractId: string

  @column({ columnName: 'classHasAcademicPeriodId' })
  declare classHasAcademicPeriodId: string | null

  @column({ columnName: 'studentHasLevelId' })
  declare studentHasLevelId: string | null

  @column({ columnName: 'invoiceUrl' })
  declare invoiceUrl: string | null

  @column({ columnName: 'paymentGatewayId' })
  declare paymentGatewayId: string | null

  @column({ columnName: 'paymentGateway' })
  declare paymentGateway: 'ASAAS' | 'CUSTOM' | null

  @column({ columnName: 'metadata' })
  declare metadata: Record<string, unknown> | null

  @column({ columnName: 'agreementId' })
  declare agreementId: string | null

  @column({ columnName: 'invoiceId' })
  declare invoiceId: string | null

  @column({ columnName: 'insuranceBillingId' })
  declare insuranceBillingId: string | null

  @column({ columnName: 'studentHasExtraClassId' })
  declare studentHasExtraClassId: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Contract, { foreignKey: 'contractId' })
  declare contract: BelongsTo<typeof Contract>

  @belongsTo(() => Invoice, { foreignKey: 'invoiceId' })
  declare invoice: BelongsTo<typeof Invoice>

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => InsuranceBilling, { foreignKey: 'insuranceBillingId' })
  declare insuranceBilling: BelongsTo<typeof InsuranceBilling>

  @hasOne(() => InsuranceClaim, { foreignKey: 'insuranceClaimId' })
  declare insuranceClaim: HasOne<typeof InsuranceClaim>

  @belongsTo(() => StudentHasExtraClass, { foreignKey: 'studentHasExtraClassId' })
  declare studentHasExtraClass: BelongsTo<typeof StudentHasExtraClass>
}
