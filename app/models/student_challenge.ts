import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StudentGamification from './student_gamification.js'
import Challenge from './challenge.js'

export default class StudentChallenge extends BaseModel {
  static table = 'StudentChallenge'

  @beforeCreate()
  static assignId(model: StudentChallenge) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentGamificationId: string

  @column()
  declare challengeId: string

  @column()
  declare progress: number

  @column()
  declare isCompleted: boolean

  @column.dateTime()
  declare completedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare startedAt: DateTime

  @belongsTo(() => StudentGamification, { foreignKey: 'studentGamificationId' })
  declare studentGamification: BelongsTo<typeof StudentGamification>

  @belongsTo(() => Challenge, { foreignKey: 'challengeId' })
  declare challenge: BelongsTo<typeof Challenge>
}
