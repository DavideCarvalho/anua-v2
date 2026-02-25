import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Canteen from './canteen.js'
import CanteenMealReservation from './canteen_meal_reservation.js'

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'

export default class CanteenMeal extends BaseModel {
  static table = 'CanteenMeal'

  @beforeCreate()
  static assignId(model: CanteenMeal) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'canteenId' })
  declare canteenId: string

  @column.date({ columnName: 'date' })
  declare date: DateTime

  @column({ columnName: 'mealType' })
  declare mealType: MealType

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'description' })
  declare description: string | null

  @column({ columnName: 'price' })
  declare price: number

  @column({ columnName: 'maxServings' })
  declare maxServings: number | null

  @column({ columnName: 'availableServings' })
  declare availableServings: number | null

  @column({ columnName: 'isActive' })
  declare isActive: boolean

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => Canteen, { foreignKey: 'canteenId' })
  declare canteen: BelongsTo<typeof Canteen>

  @hasMany(() => CanteenMealReservation, { foreignKey: 'mealId' })
  declare reservations: HasMany<typeof CanteenMealReservation>
}
