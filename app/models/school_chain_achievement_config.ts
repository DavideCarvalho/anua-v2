import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import SchoolChain from './school_chain.js'
import Achievement from './achievement.js'

export default class SchoolChainAchievementConfig extends BaseModel {
  static table = 'SchoolChainAchievementConfig'

  @beforeCreate()
  static assignId(model: SchoolChainAchievementConfig) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare schoolChainId: string

  @column()
  declare achievementId: string

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => SchoolChain, { foreignKey: 'schoolChainId' })
  declare schoolChain: BelongsTo<typeof SchoolChain>

  @belongsTo(() => Achievement, { foreignKey: 'achievementId' })
  declare achievement: BelongsTo<typeof Achievement>
}
