import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StudentGamification from './student_gamification.js'
import Achievement from './achievement.js'

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

  @column.dateTime({ autoCreate: true })
  declare unlockedAt: DateTime

  @column()
  declare progress: number

  @belongsTo(() => StudentGamification, { foreignKey: 'studentGamificationId' })
  declare studentGamification: BelongsTo<typeof StudentGamification>

  @belongsTo(() => Achievement, { foreignKey: 'achievementId' })
  declare achievement: BelongsTo<typeof Achievement>
}
