import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import StudentAchievement from './student_achievement.js'
import School from '../school.js'
import SchoolChain from '../school_chain.js'

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
  declare category: 'ACADEMIC' | 'ATTENDANCE' | 'BEHAVIOR' | 'SOCIAL' | 'SPECIAL'

  @column()
  declare criteria: Record<string, any>

  @column()
  declare isSecret: boolean

  @column()
  declare rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

  @column()
  declare maxUnlocks: number | null

  @column()
  declare recurrencePeriod: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SEMESTER' | 'ANNUAL' | null

  @column()
  declare schoolId: string | null

  @column()
  declare schoolChainId: string | null

  @column()
  declare isActive: boolean

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @belongsTo(() => SchoolChain)
  declare schoolChain: BelongsTo<typeof SchoolChain>

  @hasMany(() => StudentAchievement)
  declare studentAchievements: HasMany<typeof StudentAchievement>
}
