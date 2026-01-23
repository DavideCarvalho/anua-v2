import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentChallenge from '#models/student_challenge'
import type { DateTime } from 'luxon'

export default class StudentChallengeDto extends BaseModelDto {
  declare id: string
  declare studentGamificationId: string
  declare challengeId: string
  declare progress: number
  declare isCompleted: boolean
  declare completedAt: DateTime | null
  declare startedAt: DateTime

  constructor(model?: StudentChallenge) {
    super()

    if (!model) return

    this.id = model.id
    this.studentGamificationId = model.studentGamificationId
    this.challengeId = model.challengeId
    this.progress = model.progress
    this.isCompleted = model.isCompleted
    this.completedAt = model.completedAt
    this.startedAt = model.startedAt
  }
}
