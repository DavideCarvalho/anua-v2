import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import GameCharacterUpgrade from '#models/game_character_upgrade'

export type UpgradeType = 'click_power' | 'dps' | 'ally' | 'idle_gold'
export type EffectType = 'add' | 'multiply'

export default class GameUpgrade extends BaseModel {
  static table = 'game_upgrades'

  @beforeCreate()
  static assignId(model: GameUpgrade) {
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
  declare type: UpgradeType

  @column()
  declare baseCost: number

  @column()
  declare costMultiplier: number

  @column()
  declare effectType: EffectType

  @column()
  declare effectValue: number

  @column()
  declare maxLevel: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @hasMany(() => GameCharacterUpgrade)
  declare characterUpgrades: HasMany<typeof GameCharacterUpgrade>
}
