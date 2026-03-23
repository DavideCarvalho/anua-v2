import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { GameClass } from '#models/game_character'

export default class GameSkill extends BaseModel {
  static table = 'game_skills'

  @beforeCreate()
  static assignId(model: GameSkill) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare class: GameClass | 'all'

  @column()
  declare branch: string

  @column()
  declare requiredLevel: number

  @column()
  declare requiredSkillId: string | null

  @column()
  declare effectType: string

  @column()
  declare effectValue: number | null

  @column()
  declare icon: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => GameSkill, {
    foreignKey: 'requiredSkillId',
  })
  declare requiredSkill: BelongsTo<typeof GameSkill>
}
