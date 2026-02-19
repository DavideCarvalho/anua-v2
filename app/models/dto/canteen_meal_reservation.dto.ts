import { BaseModelDto } from '@adocasts.com/dto/base'
import type CanteenMealReservation from '#models/canteen_meal_reservation'
import type { CanteenMealReservationStatus } from '#models/canteen_meal_reservation'
import type { DateTime } from 'luxon'
import CanteenMealDto from './canteen_meal.dto.js'
import StudentDto from './student.dto.js'

export default class CanteenMealReservationDto extends BaseModelDto {
  declare id: string
  declare mealId: string
  declare studentId: string
  declare status: CanteenMealReservationStatus
  declare reservedAt: Date
  declare servedAt: Date | null
  declare cancelledAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date
  declare meal?: CanteenMealDto
  declare student?: StudentDto

  constructor(canteenMealReservation?: CanteenMealReservation) {
    super()

    if (!canteenMealReservation) return

    this.id = canteenMealReservation.id
    this.mealId = canteenMealReservation.mealId
    this.studentId = canteenMealReservation.studentId
    this.status = canteenMealReservation.status
    this.reservedAt = canteenMealReservation.reservedAt.toJSDate()
    this.servedAt = canteenMealReservation.servedAt?.toJSDate() ?? null
    this.cancelledAt = canteenMealReservation.cancelledAt?.toJSDate() ?? null
    this.createdAt = canteenMealReservation.createdAt.toJSDate()
    this.updatedAt = canteenMealReservation.updatedAt.toJSDate()
    if (canteenMealReservation.meal) this.meal = new CanteenMealDto(canteenMealReservation.meal)
    if (canteenMealReservation.student)
      this.student = new StudentDto(canteenMealReservation.student)
  }
}
