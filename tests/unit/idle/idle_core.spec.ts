import { test } from '@japa/runner'

import {
  buyUpgrade,
  canBuyUpgrade,
  click,
  createInitialIdleState,
  getIdleCharacterAnimation,
  getTotalDps,
  tick,
  type IdleUpgradeId,
} from '../../../inertia/lib/idle/idle-core.js'

test.group('idle core', () => {
  test('initial state already has automatic hero attacks', ({ assert }) => {
    const state = createInitialIdleState()
    const after20s = tick(state, 20)

    assert.isAbove(state.heroDps, 0)
    assert.isAbove(after20s.kills, 0)
  })

  test('tick deals dps to current monster', ({ assert }) => {
    const state = createInitialIdleState()
    state.heroDps = 1
    const hpBefore = state.monster.hp

    const next = tick(state, 1)

    assert.isBelow(next.monster.hp, hpBefore)
  })

  test('killing monster grants gold and spawns next monster', ({ assert }) => {
    const state = createInitialIdleState()
    state.monster.hp = 1
    state.heroDps = 5

    const next = tick(state, 1)

    assert.equal(next.kills, state.kills + 1)
    assert.isAbove(next.gold, state.gold)
    assert.equal(next.monster.wave, state.monster.wave + 1)
    assert.equal(next.monster.hp, next.monster.maxHp)
  })

  test('click deals direct damage to monster', ({ assert }) => {
    const state = createInitialIdleState()
    state.clickDamage = 3
    const hpBefore = state.monster.hp

    const next = click(state)

    assert.equal(next.monster.hp, hpBefore - 3)
  })

  test('click can execute kill and reward immediately', ({ assert }) => {
    const state = createInitialIdleState()
    state.clickDamage = 50
    state.monster.hp = 10

    const next = click(state)

    assert.equal(next.kills, state.kills + 1)
    assert.isAbove(next.gold, state.gold)
    assert.equal(next.monster.wave, state.monster.wave + 1)
  })

  test('buying upgrade changes stats and costs coins', ({ assert }) => {
    const state = createInitialIdleState()
    state.gold = 100
    const id: IdleUpgradeId = 'click_power'
    const costBefore = state.upgrades[id].cost

    const next = buyUpgrade(state, id)

    assert.equal(next.gold, 100 - costBefore)
    assert.equal(next.clickDamage, state.clickDamage + 1)
    assert.equal(next.upgrades[id].level, state.upgrades[id].level + 1)
    assert.isAbove(next.upgrades[id].cost, costBefore)
  })

  test('canBuyUpgrade reflects coin availability', ({ assert }) => {
    const state = createInitialIdleState()
    const id: IdleUpgradeId = 'hero_dps'

    state.gold = state.upgrades[id].cost - 1
    assert.isFalse(canBuyUpgrade(state, id))

    state.gold = state.upgrades[id].cost
    assert.isTrue(canBuyUpgrade(state, id))
  })

  test('hiring allies increases total dps', ({ assert }) => {
    const state = createInitialIdleState()
    state.gold = 200
    const dpsBefore = getTotalDps(state)

    const next = buyUpgrade(state, 'hire_ally')

    assert.isAbove(getTotalDps(next), dpsBefore)
  })

  test('character animation switches to work when production is active', ({ assert }) => {
    const state = createInitialIdleState()

    assert.equal(getIdleCharacterAnimation(state), 'work')

    state.heroDps = 0
    assert.equal(getIdleCharacterAnimation(state), 'idle')
  })
})
