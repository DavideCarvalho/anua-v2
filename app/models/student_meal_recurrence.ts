import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import Canteen from './canteen.js'
import CanteenMeal from './canteen_meal.js'
import type { MealType } from './canteen_meal.js'

export default class StudentMealRecurrence extends BaseModel {
  static table = 'StudentMealRecurrence'

  @beforeCreate()
  static assignId(model: StudentMealRecurrence) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'canteenId' })
  declare canteenId: string

  @column({ columnName: 'weekDay' })
  declare weekDay: number // 1=Segunda ... 5=Sexta

  @column({ columnName: 'mealType' })
  declare mealType: MealType

  @column({ columnName: 'canteenMealId' })
  declare canteenMealId: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => Canteen, { foreignKey: 'canteenId' })
  declare canteen: BelongsTo<typeof Canteen>

  @belongsTo(() => CanteenMeal, { foreignKey: 'canteenMealId' })
  declare canteenMeal: BelongsTo<typeof CanteenMeal>
}
