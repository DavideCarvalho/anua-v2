import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import CanteenMeal from './canteen_meal.js'
import Student from './student.js'

export type CanteenMealReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'SERVED'

export default class CanteenMealReservation extends BaseModel {
  static table = 'CanteenMealReservation'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare mealId: string

  @column()
  declare studentId: string

  @column()
  declare status: CanteenMealReservationStatus

  @column.dateTime()
  declare reservedAt: DateTime

  @column.dateTime()
  declare servedAt: DateTime | null

  @column.dateTime()
  declare cancelledAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => CanteenMeal, { foreignKey: 'mealId' })
  declare meal: BelongsTo<typeof CanteenMeal>

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>
}
