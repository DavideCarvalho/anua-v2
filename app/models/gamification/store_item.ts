import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import StoreOrderItem from './store_order_item.js'
import CanteenItem from '../canteen_item.js'
import School from '../school.js'

export default class StoreItem extends BaseModel {
  static table = 'StoreItem'

  @beforeCreate()
  static assignId(model: StoreItem) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare price: number

  @column()
  declare paymentMode: 'POINTS_ONLY' | 'MONEY_ONLY' | 'HYBRID'

  @column()
  declare pointsToMoneyRate: number

  @column()
  declare minPointsPercentage: number | null

  @column()
  declare maxPointsPercentage: number | null

  @column()
  declare category:
    | 'CANTEEN_FOOD'
    | 'CANTEEN_DRINK'
    | 'SCHOOL_SUPPLY'
    | 'PRIVILEGE'
    | 'HOMEWORK_PASS'
    | 'UNIFORM'
    | 'BOOK'
    | 'MERCHANDISE'
    | 'DIGITAL'
    | 'OTHER'

  @column()
  declare imageUrl: string | null

  @column()
  declare totalStock: number | null

  @column()
  declare reservedStock: number

  @column()
  declare maxPerStudent: number | null

  @column()
  declare maxPerStudentPeriod: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SEMESTER' | 'ANNUAL' | null

  @column()
  declare preparationTimeMinutes: number | null

  @column()
  declare requiresApproval: boolean

  @column()
  declare pickupLocation: string | null

  @column()
  declare isActive: boolean

  @column()
  declare schoolId: string

  @column()
  declare canteenItemId: string | null

  @column.date()
  declare availableFrom: DateTime | null

  @column.date()
  declare availableUntil: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @belongsTo(() => CanteenItem)
  declare canteenItem: BelongsTo<typeof CanteenItem>

  @hasMany(() => StoreOrderItem)
  declare orderItems: HasMany<typeof StoreOrderItem>

  get availableStock(): number | null {
    if (this.totalStock === null) return null
    return this.totalStock - this.reservedStock
  }
}
