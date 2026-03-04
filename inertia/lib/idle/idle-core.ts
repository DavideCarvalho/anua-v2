export type IdleUpgradeId = 'click_power' | 'hero_dps' | 'hire_ally'

export interface IdleUpgradeState {
  level: number
  cost: number
}

export interface IdleMonster {
  wave: number
  name: string
  hp: number
  maxHp: number
  rewardGold: number
}

export interface IdleState {
  gold: number
  kills: number
  clickDamage: number
  heroDps: number
  allyCount: number
  allyDpsEach: number
  monster: IdleMonster
  upgrades: Record<IdleUpgradeId, IdleUpgradeState>
}

export type IdleCharacterAnimation = 'idle' | 'work'

const MONSTER_NAMES = ['Slime', 'Goblin', 'Lobo', 'Mushroom', 'Golem']

function getMonsterForWave(wave: number): IdleMonster {
  const safeWave = Math.max(1, Math.floor(wave))
  const maxHp = 10 + safeWave * 3
  return {
    wave: safeWave,
    name: MONSTER_NAMES[(safeWave - 1) % MONSTER_NAMES.length],
    maxHp,
    hp: maxHp,
    rewardGold: 6 + safeWave * 2,
  }
}

function scaleCost(currentCost: number): number {
  return Math.ceil(currentCost * 1.35)
}

export function createInitialIdleState(): IdleState {
  return {
    gold: 0,
    kills: 0,
    clickDamage: 2,
    heroDps: 0.7,
    allyCount: 0,
    allyDpsEach: 0.8,
    monster: getMonsterForWave(1),
    upgrades: {
      click_power: { level: 0, cost: 10 },
      hero_dps: { level: 0, cost: 15 },
      hire_ally: { level: 0, cost: 25 },
    },
  }
}

export function getTotalDps(state: IdleState): number {
  return state.heroDps + state.allyCount * state.allyDpsEach
}

function applyDamage(state: IdleState, damage: number): IdleState {
  const remainingDamage = Math.max(0, damage)
  let next: IdleState = { ...state, monster: { ...state.monster } }

  if (remainingDamage > 0) {
    if (next.monster.hp > remainingDamage) {
      next.monster.hp -= remainingDamage
    } else {
      const nextWave = next.monster.wave + 1
      next = {
        ...next,
        gold: next.gold + next.monster.rewardGold,
        kills: next.kills + 1,
        monster: getMonsterForWave(nextWave),
      }
    }
  }

  return next
}

export function tick(state: IdleState, deltaSeconds: number): IdleState {
  const safeDelta = Math.max(0, deltaSeconds)
  return applyDamage(state, getTotalDps(state) * safeDelta)
}

export function click(state: IdleState): IdleState {
  return applyDamage(state, state.clickDamage)
}

export function canBuyUpgrade(state: IdleState, id: IdleUpgradeId): boolean {
  return state.gold >= state.upgrades[id].cost
}

export function buyUpgrade(state: IdleState, id: IdleUpgradeId): IdleState {
  if (!canBuyUpgrade(state, id)) return state

  const currentUpgrade = state.upgrades[id]
  const nextUpgrades = {
    ...state.upgrades,
    [id]: {
      level: currentUpgrade.level + 1,
      cost: scaleCost(currentUpgrade.cost),
    },
  }

  if (id === 'click_power') {
    return {
      ...state,
      gold: state.gold - currentUpgrade.cost,
      clickDamage: state.clickDamage + 1,
      upgrades: nextUpgrades,
    }
  }

  if (id === 'hero_dps') {
    return {
      ...state,
      gold: state.gold - currentUpgrade.cost,
      heroDps: state.heroDps + 0.5,
      upgrades: nextUpgrades,
    }
  }

  return {
    ...state,
    gold: state.gold - currentUpgrade.cost,
    allyCount: state.allyCount + 1,
    upgrades: nextUpgrades,
  }
}

export function formatIdleNumber(value: number): string {
  if (value < 1000) return value.toFixed(0)
  if (value < 1_000_000) return `${(value / 1000).toFixed(1)}k`
  return `${(value / 1_000_000).toFixed(1)}m`
}

export function getIdleCharacterAnimation(state: IdleState): IdleCharacterAnimation {
  return getTotalDps(state) > 0 ? 'work' : 'idle'
}
