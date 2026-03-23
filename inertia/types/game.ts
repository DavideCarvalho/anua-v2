export type GameClass = 'mage' | 'warrior' | 'dwarf'
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
export type MissionDifficulty = 'easy' | 'normal' | 'hard' | 'epic'
export type MissionStatus = 'in_progress' | 'completed' | 'claimed'
export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material'
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary'

/** JSON-serializable value (compatible with Inertia `ComponentProps`) */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export interface GameCharacter {
  id: string
  studentId: string
  name: string
  class: GameClass
  level: number
  experience: number
  gold: number
  attack: number
  defense: number
  maxHp: number
  maxMana: number
  energy: number
  maxEnergy: number
  energyRegenAt: string | null
  idleGoldPerSecond: number
  clickDamage: number
  dps: number
  allyCount: number
  currentWave: number
  unlockedSkills: string[]
  equippedWeaponId: string | null
  equippedArmorId: string | null
  equippedAccessoryId: string | null
  equippedWeapon?: GameItem
  equippedArmor?: GameItem
  equippedAccessory?: GameItem
}

export interface GameMission {
  id: string
  name: string
  description: string | null
  location: GameLocation
  difficulty: MissionDifficulty
  requiredLevel: number
  requiredClass: string[]
  durationMinutes: number
  energyCost: number
  goldRewardMin: number
  goldRewardMax: number
  experienceReward: number
  itemDropChance: Record<string, number>
  isActive: boolean
}

export interface GameCharacterMission {
  id: string
  characterId: string
  missionId: string
  mission: GameMission
  status: MissionStatus
  startedAt: string
  completesAt: string
  goldEarned: number | null
  experienceEarned: number | null
  itemsEarned: Record<string, number> | null
}

export interface GameItem {
  id: string
  name: string
  description: string | null
  type: ItemType
  rarity: ItemRarity
  attackBonus: number
  defenseBonus: number
  hpBonus: number
  manaBonus: number
  specialEffect: Record<string, JsonValue> | null
  icon: string | null
  goldPrice: number | null
}

export interface GameCharacterItem {
  id: string
  itemId: string
  item: GameItem
  quantity: number
}

export interface GameUpgrade {
  id: string
  name: string
  description: string | null
  type: string
  baseCost: number
  costMultiplier: number
  effectType: string
  effectValue: number
  maxLevel: number | null
}

export interface GameCharacterUpgrade {
  id: string
  upgradeId: string
  upgrade: GameUpgrade
  level: number
}

export interface GameIdleState {
  id: string
  characterId: string
  currentMonsterWave: number
  currentMonsterHp: number | null
  currentMonsterMaxHp: number | null
  offlineGoldEarned: number
  lastSyncAt: string
}

export const CLASS_INFO: Record<GameClass, { name: string; description: string; color: string }> = {
  mage: {
    name: 'Mago',
    description: 'Alto poder mágico, vida baixa. Especialista em magia destrutiva.',
    color: 'text-purple-500',
  },
  warrior: {
    name: 'Guerreiro',
    description: 'Balanceado em ataque e defesa. Versátil em combate.',
    color: 'text-red-500',
  },
  dwarf: {
    name: 'Anão',
    description: 'Alta vida e defesa. Resistente e forte.',
    color: 'text-amber-600',
  },
}

export const LOCATION_INFO: Record<
  GameLocation,
  { name: string; icon: string; description: string }
> = {
  tavern: { name: 'Taverna', icon: '🏠', description: 'Hub central' },
  arena: { name: 'Arena', icon: '⚔️', description: 'Batalhas infinitas' },
  forest: { name: 'Floresta', icon: '🌲', description: 'Missões de caça' },
  mountains: { name: 'Montanhas', icon: '🏔️', description: 'Missões de exploração' },
  dungeon: { name: 'Dungeon', icon: '🏰', description: 'Missões de boss' },
  academy: { name: 'Academia', icon: '📚', description: 'Habilidades' },
  market: { name: 'Mercado', icon: '🏪', description: 'Loja com gold' },
  points_shop: { name: 'Loja de Pontos', icon: '💎', description: 'Converter pontos' },
  rankings: { name: 'Rankings', icon: '🏆', description: 'Ver outros alunos' },
}
