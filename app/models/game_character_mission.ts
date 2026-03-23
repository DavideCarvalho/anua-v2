import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import GameCharacter from '#models/game_character'
import GameMission from '#models/game_mission'

export type MissionStatus = 'in_progress' | 'completed' | 'claimed'

export default class GameCharacterMission extends BaseModel {
  static table = 'game_character_missions'

  @beforeCreate()
  static assignId(model: GameCharacterMission) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare characterId: string

  @column()
  declare missionId: string

  @column()
  declare status: MissionStatus

  @column.dateTime()
  declare startedAt: DateTime

  @column.dateTime()
  declare completesAt: DateTime

  @column()
  declare goldEarned: number | null

  @column()
  declare experienceEarned: number | null

  @column()
  declare itemsEarned: Record<string, number> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => GameCharacter)
  declare character: BelongsTo<typeof GameCharacter>

  @belongsTo(() => GameMission)
  declare mission: BelongsTo<typeof GameMission>
}
