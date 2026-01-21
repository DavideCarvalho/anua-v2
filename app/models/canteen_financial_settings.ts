import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Canteen from './canteen.js'

export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM'

export default class CanteenFinancialSettings extends BaseModel {
  static table = 'CanteenFinancialSettings'

  @beforeCreate()
  static assignId(model: CanteenFinancialSettings) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare canteenId: string

  @column()
  declare platformFeePercentage: number

  @column()
  declare pixKey: string | null

  @column()
  declare pixKeyType: PixKeyType | null

  @column()
  declare bankName: string | null

  @column()
  declare accountHolder: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Canteen, { foreignKey: 'canteenId' })
  declare canteen: BelongsTo<typeof Canteen>
}
