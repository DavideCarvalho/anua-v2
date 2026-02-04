import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import CanteenItem from './canteen_item.js'
import Store from './store.js'
import StoreOrder from './store_order.js'

export type StoreItemType =
  | 'PHYSICAL_ITEM'
  | 'CANTEEN_ITEM'
  | 'PRIVILEGE'
  | 'VIRTUAL_REWARD'
  | 'EXPERIENCE'

export type StoreItemCategory =
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

export type StoreItemPaymentMode = 'POINTS_ONLY' | 'MONEY_ONLY' | 'HYBRID'

export type StoreItemPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SEMESTER' | 'ANNUAL'

export default class StoreItem extends BaseModel {
  static table = 'StoreItem'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare schoolId: string

  @column()
  declare storeId: string | null

  @column()
  declare canteenItemId: string | null

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare price: number

  @column()
  declare paymentMode: StoreItemPaymentMode

  @column()
  declare pointsToMoneyRate: number | null

  @column()
  declare minPointsPercentage: number | null

  @column()
  declare maxPointsPercentage: number | null

  @column()
  declare category: StoreItemCategory

  @column()
  declare imageUrl: string | null

  @column()
  declare totalStock: number | null

  @column()
  declare maxPerStudent: number | null

  @column()
  declare maxPerStudentPeriod: StoreItemPeriod | null

  @column()
  declare preparationTimeMinutes: number | null

  @column()
  declare requiresApproval: boolean

  @column()
  declare pickupLocation: string | null

  @column.dateTime()
  declare availableFrom: DateTime | null

  @column.dateTime()
  declare availableUntil: DateTime | null

  @column()
  declare isActive: boolean

  @column()
  declare metadata: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => Store, { foreignKey: 'storeId' })
  declare store: BelongsTo<typeof Store>

  @belongsTo(() => CanteenItem, { foreignKey: 'canteenItemId' })
  declare canteenItem: BelongsTo<typeof CanteenItem>

  @hasMany(() => StoreOrder, { foreignKey: 'storeItemId' })
  declare orders: HasMany<typeof StoreOrder>
}
