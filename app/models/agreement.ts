import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import AgreementEarlyDiscount from './agreement_early_discount.js'

export default class Agreement extends BaseModel {
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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => AgreementEarlyDiscount, { foreignKey: 'agreementId' })
  declare earlyDiscounts: HasMany<typeof AgreementEarlyDiscount>
}
