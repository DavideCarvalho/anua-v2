import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Agreement from './agreement.js'

export default class AgreementEarlyDiscount extends BaseModel {
  static table = 'AgreementEarlyDiscount'

  @beforeCreate()
  static assignId(model: AgreementEarlyDiscount) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare agreementId: string

  @column()
  declare discountType: 'PERCENTAGE' | 'FLAT'

  @column()
  declare percentage: number | null

  @column()
  declare flatAmount: number | null

  @column()
  declare daysBeforeDeadline: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Agreement, { foreignKey: 'agreementId' })
  declare agreement: BelongsTo<typeof Agreement>
}
