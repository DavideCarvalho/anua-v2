import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import CanteenMeal from './canteen_meal.js'
import Student from './student.js'

export type CanteenMealReservationStatus = 'RESERVED' | 'SERVED' | 'CANCELLED'

export default class CanteenMealReservation extends BaseModel {
  static table = 'CanteenMealReservation'

  @beforeCreate()
  static assignId(model: CanteenMealReservation) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'mealId' })
  declare mealId: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'status' })
  declare status: CanteenMealReservationStatus

  @column.dateTime({ columnName: 'reservedAt' })
  declare reservedAt: DateTime

  @column.dateTime({ columnName: 'servedAt' })
  declare servedAt: DateTime | null

  @column.dateTime({ columnName: 'cancelledAt' })
  declare cancelledAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => CanteenMeal, { foreignKey: 'mealId' })
  declare meal: BelongsTo<typeof CanteenMeal>

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>
}
