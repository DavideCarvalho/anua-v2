import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Challenge from './challenge.js'
import StudentGamification from '../student_gamification.js'

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

  @column.dateTime()
  declare startedAt: DateTime

  @belongsTo(() => StudentGamification)
  declare studentGamification: BelongsTo<typeof StudentGamification>

  @belongsTo(() => Challenge)
  declare challenge: BelongsTo<typeof Challenge>
}
