import { BaseModelDto } from '@adocasts.com/dto/base'
import type Challenge from '#models/challenge'
import type { ChallengeCategory, RecurrencePeriod } from '#models/challenge'

export default class ChallengeDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare description: string
  declare icon: string | null
  declare points: number
  declare category: ChallengeCategory
  declare criteria: Record<string, unknown>
  declare isRecurring: boolean
  declare recurrencePeriod: RecurrencePeriod | null
  declare startDate: Date | null
  declare endDate: Date | null
  declare schoolId: string | null
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date

  constructor(challenge?: Challenge) {
    super()

    if (!challenge) return

    this.id = challenge.id
    this.name = challenge.name
    this.description = challenge.description
    this.icon = challenge.icon
    this.points = challenge.points
    this.category = challenge.category
    this.criteria = challenge.criteria
    this.isRecurring = challenge.isRecurring
    this.recurrencePeriod = challenge.recurrencePeriod
    this.startDate = challenge.startDate ? challenge.startDate.toJSDate() : null
    this.endDate = challenge.endDate ? challenge.endDate.toJSDate() : null
    this.schoolId = challenge.schoolId
    this.isActive = challenge.isActive
    this.createdAt = challenge.createdAt.toJSDate()
    this.updatedAt = challenge.updatedAt.toJSDate()
  }
}
