import { BaseModelDto } from '@adocasts.com/dto/base'
import type Achievement from '#models/achievement'
import type { AchievementCategory, AchievementRarity, RecurrencePeriod } from '#models/achievement'
import type { DateTime } from 'luxon'

export default class AchievementDto extends BaseModelDto {
  declare id: string
  declare slug: string
  declare name: string
  declare description: string
  declare icon: string | null
  declare points: number
  declare category: AchievementCategory
  declare criteria: Record<string, unknown>
  declare isSecret: boolean
  declare rarity: AchievementRarity
  declare maxUnlocks: number | null
  declare recurrencePeriod: RecurrencePeriod | null
  declare schoolId: string | null
  declare schoolChainId: string | null
  declare isActive: boolean
  declare deletedAt: DateTime | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(achievement?: Achievement) {
    super()

    if (!achievement) return

    this.id = achievement.id
    this.slug = achievement.slug
    this.name = achievement.name
    this.description = achievement.description
    this.icon = achievement.icon
    this.points = achievement.points
    this.category = achievement.category
    this.criteria = achievement.criteria
    this.isSecret = achievement.isSecret
    this.rarity = achievement.rarity
    this.maxUnlocks = achievement.maxUnlocks
    this.recurrencePeriod = achievement.recurrencePeriod
    this.schoolId = achievement.schoolId
    this.schoolChainId = achievement.schoolChainId
    this.isActive = achievement.isActive
    this.deletedAt = achievement.deletedAt
    this.createdAt = achievement.createdAt
    this.updatedAt = achievement.updatedAt
  }
}
