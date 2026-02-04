import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Store from './store.js'

export default class StoreInstallmentRule extends BaseModel {
  static table = 'StoreInstallmentRule'

  @beforeCreate()
  static assignId(model: StoreInstallmentRule) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare minAmount: number

  @column()
  declare maxInstallments: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Store, { foreignKey: 'storeId' })
  declare store: BelongsTo<typeof Store>
}
