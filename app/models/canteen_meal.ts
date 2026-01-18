import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Canteen from './canteen.js'
import CanteenMealReservation from './canteen_meal_reservation.js'

export default class CanteenMeal extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare canteenId: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare price: number

  @column.dateTime()
  declare servedAt: DateTime

  @column()
  declare isActive: boolean

  @column()
  declare maxReservations: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Canteen)
  declare canteen: BelongsTo<typeof Canteen>

  @hasMany(() => CanteenMealReservation)
  declare reservations: HasMany<typeof CanteenMealReservation>
}
