import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class EmployeeBenefit extends BaseModel {
  static table = 'EmployeeBenefit'

  @beforeCreate()
  static assignId(model: EmployeeBenefit) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare value: number

  @column()
  declare description: string | null

  @column()
  declare deductionPercentage: number

  @column()
  declare userId: string

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
