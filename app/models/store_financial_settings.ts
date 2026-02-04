import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Store from './store.js'

export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM'

export default class StoreFinancialSettings extends BaseModel {
  static table = 'StoreFinancialSettings'

  @beforeCreate()
  static assignId(model: StoreFinancialSettings) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare platformFeePercentage: number | null

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

  @belongsTo(() => Store, { foreignKey: 'storeId' })
  declare store: BelongsTo<typeof Store>
}
