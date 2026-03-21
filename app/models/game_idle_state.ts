import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import GameCharacter from '#models/game_character'

export default class GameIdleState extends BaseModel {
  static table = 'game_idle_states'

  @beforeCreate()
  static assignId(model: GameIdleState) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare characterId: string

  @column()
  declare currentMonsterWave: number

  @column()
  declare currentMonsterHp: number | null

  @column()
  declare currentMonsterMaxHp: number | null

  @column()
  declare offlineGoldEarned: number

  @column.dateTime()
  declare lastSyncAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => GameCharacter)
  declare character: BelongsTo<typeof GameCharacter>
}
