import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import StoreOrderItem from './store_order_item.js'
import School from './school.js'
import User from './user.js'

export type StoreOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELED'
  | 'REJECTED'

export default class StoreOrder extends BaseModel {
  static table = 'StoreOrder'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare orderNumber: string

  @column()
  declare studentId: string

  @column()
  declare schoolId: string

  @column()
  declare status: StoreOrderStatus

  @column()
  declare totalPrice: number

  @column()
  declare totalPoints: number

  @column()
  declare totalMoney: number

  @column.dateTime()
  declare paidAt: DateTime | null

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime()
  declare preparingAt: DateTime | null

  @column.dateTime()
  declare readyAt: DateTime | null

  @column.dateTime()
  declare deliveredAt: DateTime | null

  @column.dateTime()
  declare canceledAt: DateTime | null

  @column.dateTime()
  declare estimatedReadyAt: DateTime | null

  @column()
  declare studentNotes: string | null

  @column()
  declare internalNotes: string | null

  @column()
  declare cancellationReason: string | null

  @column()
  declare approvedBy: string | null

  @column()
  declare preparedBy: string | null

  @column()
  declare deliveredBy: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => User, { foreignKey: 'approvedBy' })
  declare approver: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'preparedBy' })
  declare preparer: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'deliveredBy' })
  declare deliverer: BelongsTo<typeof User>

  @hasMany(() => StoreOrderItem, { foreignKey: 'orderId' })
  declare items: HasMany<typeof StoreOrderItem>
}
