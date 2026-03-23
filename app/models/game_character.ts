import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Student from '#models/student'
import GameCharacterMission from '#models/game_character_mission'
import GameCharacterItem from '#models/game_character_item'
import GameCharacterUpgrade from '#models/game_character_upgrade'
import GameIdleState from '#models/game_idle_state'
import GameItem from '#models/game_item'

export type GameClass = 'mage' | 'warrior' | 'dwarf'

export const CLASS_STATS: Record<
  GameClass,
  { attack: number; defense: number; hp: number; mana: number }
> = {
  mage: { attack: 15, defense: 5, hp: 80, mana: 80 },
  warrior: { attack: 10, defense: 10, hp: 100, mana: 40 },
  dwarf: { attack: 12, defense: 14, hp: 120, mana: 30 },
}

export default class GameCharacter extends BaseModel {
  static table = 'game_characters'

  @beforeCreate()
  static assignId(model: GameCharacter) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare name: string

  @column()
  declare class: GameClass

  @column()
  declare level: number

  @column()
  declare experience: number

  @column()
  declare gold: number

  @column()
  declare attack: number

  @column()
  declare defense: number

  @column()
  declare maxHp: number

  @column()
  declare maxMana: number

  @column()
  declare energy: number

  @column()
  declare maxEnergy: number

  @column.dateTime()
  declare energyRegenAt: DateTime | null

  @column()
  declare idleGoldPerSecond: number

  @column()
  declare clickDamage: number

  @column()
  declare dps: number

  @column()
  declare allyCount: number

  @column()
  declare currentWave: number

  @column()
  declare unlockedSkills: string[]

  @column()
  declare equippedWeaponId: string | null

  @column()
  declare equippedArmorId: string | null

  @column()
  declare equippedAccessoryId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>

  @hasMany(() => GameCharacterMission)
  declare missions: HasMany<typeof GameCharacterMission>

  @hasMany(() => GameCharacterItem)
  declare items: HasMany<typeof GameCharacterItem>

  @hasMany(() => GameCharacterUpgrade)
  declare upgrades: HasMany<typeof GameCharacterUpgrade>

  @hasOne(() => GameIdleState)
  declare idleState: HasOne<typeof GameIdleState>

  @belongsTo(() => GameItem, {
    foreignKey: 'equippedWeaponId',
  })
  declare equippedWeapon: BelongsTo<typeof GameItem>

  @belongsTo(() => GameItem, {
    foreignKey: 'equippedArmorId',
  })
  declare equippedArmor: BelongsTo<typeof GameItem>

  @belongsTo(() => GameItem, {
    foreignKey: 'equippedAccessoryId',
  })
  declare equippedAccessory: BelongsTo<typeof GameItem>
}
