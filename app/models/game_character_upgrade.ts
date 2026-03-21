import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import GameCharacter from '#models/game_character'
import GameUpgrade from '#models/game_upgrade'

export default class GameCharacterUpgrade extends BaseModel {
  static table = 'game_character_upgrades'

  @beforeCreate()
  static assignId(model: GameCharacterUpgrade) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare characterId: string

  @column()
  declare upgradeId: string

  @column()
  declare level: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => GameCharacter)
  declare character: BelongsTo<typeof GameCharacter>

  @belongsTo(() => GameUpgrade)
  declare upgrade: BelongsTo<typeof GameUpgrade>
}
