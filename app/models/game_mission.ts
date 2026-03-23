import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import GameCharacterMission from '#models/game_character_mission'

export type MissionDifficulty = 'easy' | 'normal' | 'hard' | 'epic'
export type GameLocation =
  | 'tavern'
  | 'arena'
  | 'forest'
  | 'mountains'
  | 'dungeon'
  | 'academy'
  | 'market'
  | 'points_shop'
  | 'rankings'

export default class GameMission extends BaseModel {
  static table = 'game_missions'

  @beforeCreate()
  static assignId(model: GameMission) {
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
  declare location: GameLocation

  @column()
  declare difficulty: MissionDifficulty

  @column()
  declare requiredLevel: number

  @column()
  declare requiredClass: string[]

  @column()
  declare durationMinutes: number

  @column()
  declare energyCost: number

  @column()
  declare goldRewardMin: number

  @column()
  declare goldRewardMax: number

  @column()
  declare experienceReward: number

  @column()
  declare itemDropChance: Record<string, number>

  @column()
  declare isActive: boolean

  @column()
  declare availableFrom: string | null

  @column()
  declare availableUntil: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => GameCharacterMission)
  declare characterMissions: HasMany<typeof GameCharacterMission>
}
