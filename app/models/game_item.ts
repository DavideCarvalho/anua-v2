import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import GameCharacterItem from '#models/game_character_item'

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material'
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary'

export default class GameItem extends BaseModel {
  static table = 'game_items'

  @beforeCreate()
  static assignId(model: GameItem) {
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
  declare type: ItemType

  @column()
  declare rarity: ItemRarity

  @column()
  declare attackBonus: number

  @column()
  declare defenseBonus: number

  @column()
  declare hpBonus: number

  @column()
  declare manaBonus: number

  @column()
  declare specialEffect: Record<string, unknown> | null

  @column()
  declare icon: string | null

  @column()
  declare goldPrice: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @hasMany(() => GameCharacterItem)
  declare characterItems: HasMany<typeof GameCharacterItem>
}
