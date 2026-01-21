import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import PointTransaction from './point_transaction.js'

export default class StudentGamification extends BaseModel {
  static table = 'StudentGamification'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare totalPoints: number

  @column()
  declare currentLevel: number

  @column()
  declare levelProgress: number

  @column()
  declare streak: number

  @column()
  declare longestStreak: number

  @column.dateTime()
  declare lastActivityAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @hasMany(() => PointTransaction, { foreignKey: 'studentGamificationId' })
  declare pointTransactions: HasMany<typeof PointTransaction>
}
