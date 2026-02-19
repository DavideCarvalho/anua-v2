import { BaseModelDto } from '@adocasts.com/dto/base'
import type CanteenMeal from '#models/canteen_meal'
import type { MealType } from '#models/canteen_meal'

export default class CanteenMealDto extends BaseModelDto {
  declare id: string
  declare canteenId: string
  declare date: Date
  declare mealType: MealType
  declare name: string
  declare description: string | null
  declare price: number
  declare maxServings: number | null
  declare availableServings: number | null
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date

  constructor(canteenMeal?: CanteenMeal) {
    super()

    if (!canteenMeal) return

    this.id = canteenMeal.id
    this.canteenId = canteenMeal.canteenId
    this.date = canteenMeal.date.toJSDate()
    this.mealType = canteenMeal.mealType
    this.name = canteenMeal.name
    this.description = canteenMeal.description
    this.price = canteenMeal.price
    this.maxServings = canteenMeal.maxServings
    this.availableServings = canteenMeal.availableServings
    this.isActive = canteenMeal.isActive
    this.createdAt = canteenMeal.createdAt.toJSDate()
    this.updatedAt = canteenMeal.updatedAt.toJSDate()
  }
}
