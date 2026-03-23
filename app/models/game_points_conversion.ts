import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from '#models/student'

export default class GamePointsConversion extends BaseModel {
  static table = 'game_points_conversions'

  @beforeCreate()
  static assignId(model: GamePointsConversion) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare pointsSpent: number

  @column()
  declare goldReceived: number

  @column()
  declare rate: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>
}
