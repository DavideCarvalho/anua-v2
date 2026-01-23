import { BaseModelDto } from '@adocasts.com/dto/base'
import type CanteenMealReservation from '#models/canteen_meal_reservation'
import type { CanteenMealReservationStatus } from '#models/canteen_meal_reservation'
import type { DateTime } from 'luxon'

export default class CanteenMealReservationDto extends BaseModelDto {
  declare id: string
  declare mealId: string
  declare studentId: string
  declare status: CanteenMealReservationStatus
  declare reservedAt: DateTime
  declare servedAt: DateTime | null
  declare cancelledAt: DateTime | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(canteenMealReservation?: CanteenMealReservation) {
    super()

    if (!canteenMealReservation) return

    this.id = canteenMealReservation.id
    this.mealId = canteenMealReservation.mealId
    this.studentId = canteenMealReservation.studentId
    this.status = canteenMealReservation.status
    this.reservedAt = canteenMealReservation.reservedAt
    this.servedAt = canteenMealReservation.servedAt
    this.cancelledAt = canteenMealReservation.cancelledAt
    this.createdAt = canteenMealReservation.createdAt
    this.updatedAt = canteenMealReservation.updatedAt
  }
}
