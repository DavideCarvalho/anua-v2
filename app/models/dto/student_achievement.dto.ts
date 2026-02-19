import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentAchievement from '#models/student_achievement'

export default class StudentAchievementDto extends BaseModelDto {
  declare id: string
  declare studentGamificationId: string
  declare achievementId: string
  declare unlockedAt: Date
  declare progress: number

  constructor(model?: StudentAchievement) {
    super()

    if (!model) return

    this.id = model.id
    this.studentGamificationId = model.studentGamificationId
    this.achievementId = model.achievementId
    this.unlockedAt = model.unlockedAt.toJSDate()
    this.progress = model.progress
  }
}
