import { test } from '@japa/runner'

import { getCuteFantasyFrameRect } from '../../../inertia/engine/assets/external-player.js'

test.group('external player', () => {
  test('uses cute fantasy frame grid coordinates', ({ assert }) => {
    assert.deepEqual(getCuteFantasyFrameRect('down', 0), { x: 16, y: 16, w: 32, h: 32 })
    assert.deepEqual(getCuteFantasyFrameRect('right', 1), { x: 80, y: 80, w: 32, h: 32 })
    assert.deepEqual(getCuteFantasyFrameRect('up', 3), { x: 208, y: 144, w: 32, h: 32 })
    assert.deepEqual(getCuteFantasyFrameRect('left', 2), { x: 144, y: 80, w: 32, h: 32 })
  })
})
