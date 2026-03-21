import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import GameCharacter from '#models/game_character'
import GameItem from '#models/game_item'

export default class GameCharacterItem extends BaseModel {
  static table = 'game_character_items'

  @beforeCreate()
  static assignId(model: GameCharacterItem) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare characterId: string

  @column()
  declare itemId: string

  @column()
  declare quantity: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => GameCharacter)
  declare character: BelongsTo<typeof GameCharacter>

  @belongsTo(() => GameItem)
  declare item: BelongsTo<typeof GameItem>
}
