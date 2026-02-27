import { BaseModelDto } from '@adocasts.com/dto/base'
import type Achievement from '#models/achievement'
import type { AchievementCategory, AchievementRarity, RecurrencePeriod } from '#models/achievement'
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

  constructor(achievement: Achievement) {
    super()

    const toDate = (date: unknown): Date | null => {
      if (!date) return null
      if (date instanceof Date) return date
      if (typeof date === 'string') return new Date(date)
      if (typeof (date as any)?.toJSDate === 'function') return (date as any).toJSDate()
      return new Date(date as any)
    }

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
    this.deletedAt = toDate(achievement.deletedAt)
    this.createdAt = toDate(achievement.createdAt)!
    this.updatedAt = toDate(achievement.updatedAt)!
    this.school = achievement.school ? new SchoolDto(achievement.school) : undefined
  }
}
