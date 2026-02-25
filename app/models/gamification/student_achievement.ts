import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Achievement from './achievement.js'
import StudentGamification from '../student_gamification.js'

export default class StudentAchievement extends BaseModel {
  static table = 'StudentAchievement'

  @beforeCreate()
  static assignId(model: StudentAchievement) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentGamificationId: string

  @column()
  declare achievementId: string

  @column.dateTime()
  declare unlockedAt: DateTime

  @column()
  declare progress: number

  @belongsTo(() => StudentGamification)
  declare studentGamification: BelongsTo<typeof StudentGamification>

  @belongsTo(() => Achievement)
  declare achievement: BelongsTo<typeof Achievement>
}
