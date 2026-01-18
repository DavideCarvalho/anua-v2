import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import StoreItem from './store_item.js'
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
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare storeItemId: string

  @column()
  declare schoolId: string

  @column()
  declare quantity: number

  @column()
  declare pointsCost: number

  @column()
  declare totalPointsCost: number

  @column()
  declare status: StoreOrderStatus

  @column()
  declare approvedBy: string | null

  @column()
  declare preparedBy: string | null

  @column()
  declare deliveredBy: string | null

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime()
  declare preparedAt: DateTime | null

  @column.dateTime()
  declare deliveredAt: DateTime | null

  @column.dateTime()
  declare cancelledAt: DateTime | null

  @column()
  declare notes: string | null

  @column()
  declare rejectionReason: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => StoreItem)
  declare storeItem: BelongsTo<typeof StoreItem>

  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @belongsTo(() => User, { foreignKey: 'approvedBy' })
  declare approver: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'preparedBy' })
  declare preparer: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'deliveredBy' })
  declare deliverer: BelongsTo<typeof User>

  @hasMany(() => StoreOrderItem)
  declare items: HasMany<typeof StoreOrderItem>
}
