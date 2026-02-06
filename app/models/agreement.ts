import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import { Auditable } from '@stouder-io/adonis-auditing'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Invoice from './invoice.js'
import AgreementEarlyDiscount from './agreement_early_discount.js'

export default class Agreement extends compose(BaseModel, Auditable) {
  static table = 'Agreement'

  @beforeCreate()
  static assignId(model: Agreement) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare totalAmount: number

  @column()
  declare installments: number

  @column.date()
  declare startDate: DateTime

  @column()
  declare paymentDay: number

  @column()
  declare paymentMethod: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'CASH' | 'OTHER' | null

  @column()
  declare billingType: 'UPFRONT' | 'MONTHLY'

  @column()
  declare finePercentage: number | null

  @column()
  declare dailyInterestPercentage: number | null

  @column()
  declare invoiceId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Invoice, { foreignKey: 'invoiceId' })
  declare invoice: BelongsTo<typeof Invoice>

  @hasMany(() => AgreementEarlyDiscount, { foreignKey: 'agreementId' })
  declare earlyDiscounts: HasMany<typeof AgreementEarlyDiscount>
}
