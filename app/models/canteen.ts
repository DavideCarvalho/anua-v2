import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import User from './user.js'
import CanteenItem from './canteen_item.js'
import CanteenPurchase from './canteen_purchase.js'
import CanteenMeal from './canteen_meal.js'
import CanteenMonthlyTransfer from './canteen_monthly_transfer.js'

export default class Canteen extends BaseModel {
  static table = 'Canteen'

  @beforeCreate()
  static assignId(model: Canteen) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare schoolId: string

  @column()
  declare responsibleUserId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => User, { foreignKey: 'responsibleUserId' })
  declare responsibleUser: BelongsTo<typeof User>

  @hasMany(() => CanteenItem, { foreignKey: 'canteenId' })
  declare items: HasMany<typeof CanteenItem>

  @hasMany(() => CanteenPurchase, { foreignKey: 'canteenId' })
  declare purchases: HasMany<typeof CanteenPurchase>

  @hasMany(() => CanteenMeal, { foreignKey: 'canteenId' })
  declare meals: HasMany<typeof CanteenMeal>

  @hasMany(() => CanteenMonthlyTransfer, { foreignKey: 'canteenId' })
  declare monthlyTransfers: HasMany<typeof CanteenMonthlyTransfer>
}
