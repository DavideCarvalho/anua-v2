import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Canteen from './canteen.js'
import CanteenMealReservation from './canteen_meal_reservation.js'

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'

export default class CanteenMeal extends BaseModel {
  static table = 'CanteenMeal'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare canteenId: string

  @column.date()
  declare date: DateTime

  @column()
  declare mealType: MealType

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare price: number

  @column()
  declare maxServings: number | null

  @column()
  declare availableServings: number | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Canteen, { foreignKey: 'canteenId' })
  declare canteen: BelongsTo<typeof Canteen>

  @hasMany(() => CanteenMealReservation, { foreignKey: 'mealId' })
  declare reservations: HasMany<typeof CanteenMealReservation>
}
