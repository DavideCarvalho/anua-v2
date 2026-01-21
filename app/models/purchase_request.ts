import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import School from './school.js'

export type PurchaseRequestStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'BOUGHT' | 'ARRIVED'

export default class PurchaseRequest extends BaseModel {
  static table = 'PurchaseRequest'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare schoolId: string

  @column()
  declare requestingUserId: string

  @column()
  declare productName: string

  @column()
  declare quantity: number

  @column()
  declare finalQuantity: number | null

  @column()
  declare status: PurchaseRequestStatus

  @column()
  declare proposal: string | null

  @column.date()
  declare dueDate: DateTime

  @column()
  declare value: number

  @column()
  declare unitValue: number

  @column()
  declare finalUnitValue: number | null

  @column()
  declare finalValue: number | null

  @column()
  declare description: string | null

  @column()
  declare productUrl: string | null

  @column.date()
  declare purchaseDate: DateTime | null

  @column.date()
  declare estimatedArrivalDate: DateTime | null

  @column.date()
  declare arrivalDate: DateTime | null

  @column()
  declare rejectionReason: string | null

  @column()
  declare receiptPath: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => User, { foreignKey: 'requestingUserId' })
  declare requestingUser: BelongsTo<typeof User>
}
