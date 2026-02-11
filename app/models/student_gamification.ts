import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import PointTransaction from './point_transaction.js'

export default class StudentGamification extends BaseModel {
  static table = 'StudentGamification'

  @beforeCreate()
  static assignId(model: StudentGamification) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'totalPoints' })
  declare totalPoints: number

  @column({ columnName: 'currentLevel' })
  declare currentLevel: number

  @column({ columnName: 'levelProgress' })
  declare levelProgress: number

  @column({ columnName: 'streak' })
  declare streak: number

  @column({ columnName: 'longestStreak' })
  declare longestStreak: number

  @column.dateTime({ columnName: 'lastActivityAt' })
  declare lastActivityAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @hasMany(() => PointTransaction, { foreignKey: 'studentGamificationId' })
  declare pointTransactions: HasMany<typeof PointTransaction>
}
