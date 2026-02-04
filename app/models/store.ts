import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, hasOne, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import User from './user.js'
import StoreItem from './store_item.js'
import StoreOrder from './store_order.js'
import StoreFinancialSettings from './store_financial_settings.js'
import StoreSettlement from './store_settlement.js'
import StoreInstallmentRule from './store_installment_rule.js'

export type StoreType = 'INTERNAL' | 'THIRD_PARTY'

export default class Store extends BaseModel {
  static table = 'Store'

  @beforeCreate()
  static assignId(model: Store) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare schoolId: string

  @column()
  declare ownerUserId: string | null

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare type: StoreType

  @column()
  declare commissionPercentage: number | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  // Relationships
  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => User, { foreignKey: 'ownerUserId' })
  declare owner: BelongsTo<typeof User>

  @hasMany(() => StoreItem, { foreignKey: 'storeId' })
  declare items: HasMany<typeof StoreItem>

  @hasMany(() => StoreOrder, { foreignKey: 'storeId' })
  declare orders: HasMany<typeof StoreOrder>

  @hasOne(() => StoreFinancialSettings, { foreignKey: 'storeId' })
  declare financialSettings: HasOne<typeof StoreFinancialSettings>

  @hasMany(() => StoreSettlement, { foreignKey: 'storeId' })
  declare settlements: HasMany<typeof StoreSettlement>

  @hasMany(() => StoreInstallmentRule, { foreignKey: 'storeId' })
  declare installmentRules: HasMany<typeof StoreInstallmentRule>
}
