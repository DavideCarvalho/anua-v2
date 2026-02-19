import { BaseModelDto } from '@adocasts.com/dto/base'
import type Achievement from '#models/achievement'
import type { AchievementCategory, AchievementRarity, RecurrencePeriod } from '#models/achievement'
import type { DateTime } from 'luxon'
import SchoolDto from './school.dto.js'

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
  declare deletedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date
  declare school?: SchoolDto

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
    this.deletedAt = achievement.deletedAt?.toJSDate() ?? null
    this.createdAt = achievement.createdAt.toJSDate()
    this.updatedAt = achievement.updatedAt.toJSDate()
    this.school = achievement.school ? new SchoolDto(achievement.school) : undefined
  }
}
