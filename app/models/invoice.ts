import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import { Auditable } from '@stouder-io/adonis-auditing'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import Contract from './contract.js'
import StudentPayment from './student_payment.js'

export default class Invoice extends compose(BaseModel, Auditable) {
  static table = 'Invoice'

  @beforeCreate()
  static assignId(model: Invoice) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'contractId' })
  declare contractId: string | null

  @column({ columnName: 'type' })
  declare type: 'MONTHLY' | 'UPFRONT'

  @column({ columnName: 'month' })
  declare month: number | null

  @column({ columnName: 'year' })
  declare year: number | null

  @column.date({ columnName: 'dueDate' })
  declare dueDate: DateTime

  @column({ columnName: 'status' })
  declare status: 'OPEN' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'RENEGOTIATED'

  @column({ columnName: 'totalAmount' })
  declare totalAmount: number

  @column({ columnName: 'netAmountReceived' })
  declare netAmountReceived: number | null

  @column.dateTime({ columnName: 'paidAt' })
  declare paidAt: DateTime | null

  @column({ columnName: 'paymentMethod' })
  declare paymentMethod: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'CASH' | 'OTHER' | null

  @column({ columnName: 'paymentGatewayId' })
  declare paymentGatewayId: string | null

  @column({ columnName: 'paymentGateway' })
  declare paymentGateway: 'ASAAS' | 'CUSTOM' | null

  @column({ columnName: 'observation' })
  declare observation: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => Contract, { foreignKey: 'contractId' })
  declare contract: BelongsTo<typeof Contract>

  @hasMany(() => StudentPayment, { foreignKey: 'invoiceId' })
  declare payments: HasMany<typeof StudentPayment>
}
