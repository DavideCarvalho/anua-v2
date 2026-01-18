import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import SchoolChain from './school_chain.js'

export type AchievementType = 'ACADEMIC_PERFORMANCE' | 'ATTENDANCE' | 'BEHAVIOR' | 'PARTICIPATION' | 'STREAK' | 'SOCIAL' | 'SPECIAL'

export default class Achievement extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare schoolId: string | null

  @column()
  declare schoolChainId: string | null

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare iconUrl: string | null

  @column()
  declare badgeColor: string | null

  @column()
  declare type: AchievementType

  @column()
  declare criteria: Record<string, unknown>

  @column()
  declare pointsReward: number

  @column()
  declare isActive: boolean

  @column()
  declare isRepeatable: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @belongsTo(() => SchoolChain)
  declare schoolChain: BelongsTo<typeof SchoolChain>
}
