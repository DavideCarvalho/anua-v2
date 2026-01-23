import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentGamification from '#models/student_gamification'
import type { DateTime } from 'luxon'

export default class StudentGamificationDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare totalPoints: number
  declare currentLevel: number
  declare levelProgress: number
  declare streak: number
  declare longestStreak: number
  declare lastActivityAt: DateTime | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: StudentGamification) {
    super()

    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.totalPoints = model.totalPoints
    this.currentLevel = model.currentLevel
    this.levelProgress = model.levelProgress
    this.streak = model.streak
    this.longestStreak = model.longestStreak
    this.lastActivityAt = model.lastActivityAt
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
