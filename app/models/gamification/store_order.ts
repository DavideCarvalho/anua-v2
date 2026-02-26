import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import StoreOrderItem from './store_order_item.js'
import Student from '#models/student'
import School from '#models/school'
import User from '#models/user'

export default class StoreOrder extends BaseModel {
  static table = 'StoreOrder'

  @beforeCreate()
  static assignId(model: StoreOrder) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare orderNumber: string

  @column()
  declare studentId: string

  @column()
  declare schoolId: string

  @column()
  declare status:
    | 'PENDING_PAYMENT'
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'PREPARING'
    | 'READY'
    | 'DELIVERED'
    | 'CANCELED'
    | 'REJECTED'

  @column()
  declare totalPrice: number

  @column()
  declare totalPoints: number

  @column()
  declare totalMoney: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

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

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @belongsTo(() => User, { foreignKey: 'approvedBy' })
  declare approvedByUser: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'preparedBy' })
  declare preparedByUser: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'deliveredBy' })
  declare deliveredByUser: BelongsTo<typeof User>

  @hasMany(() => StoreOrderItem)
  declare items: HasMany<typeof StoreOrderItem>
}
