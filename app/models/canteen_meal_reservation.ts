import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import CanteenMeal from './canteen_meal.js'
import User from './user.js'

export type CanteenMealReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CONSUMED'

export default class CanteenMealReservation extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare canteenMealId: string

  @column()
  declare userId: string

  @column()
  declare quantity: number

  @column()
  declare status: CanteenMealReservationStatus

  @column.dateTime()
  declare consumedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => CanteenMeal)
  declare meal: BelongsTo<typeof CanteenMeal>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
