import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate, beforeSave } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import SchoolChain from './school_chain.js'

export type AchievementCategory = 'ACADEMIC' | 'ATTENDANCE' | 'BEHAVIOR' | 'SOCIAL' | 'SPECIAL'

export type AchievementRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
export type RecurrencePeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'ONCE'

export default class Achievement extends BaseModel {
  static table = 'Achievement'

  @beforeCreate()
  static assignId(model: Achievement) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare slug: string

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare icon: string | null

  @column()
  declare points: number

  @column()
  declare category: AchievementCategory

  @column()
  declare criteria: Record<string, unknown>

  @column({ columnName: 'isSecret' })
  declare isSecret: boolean

  @column()
  declare rarity: AchievementRarity

  @column()
  declare maxUnlocks: number | null

  @column({ columnName: 'recurrencePeriod' })
  declare recurrencePeriod: RecurrencePeriod | null

  @column({ columnName: 'schoolId' })
  declare schoolId: string | null

  @column({ columnName: 'schoolChainId' })
  declare schoolChainId: string | null

  @column({ columnName: 'isActive' })
  declare isActive: boolean

  @column({ columnName: 'deletedAt' })
  declare deletedAt: DateTime | null

  @column({ columnName: 'createdAt' })
  declare createdAt: DateTime

  @column({ columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @beforeSave()
  static updateTimestamp(model: Achievement) {
    model.updatedAt = DateTime.now()
  }

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => SchoolChain, { foreignKey: 'schoolChainId' })
  declare schoolChain: BelongsTo<typeof SchoolChain>
}
