import { test } from '@japa/runner'

import {
  getPlayerBaseScale,
  getSpriteScaleForDirection,
} from '../../../inertia/engine/player/player-sprite.js'

test.group('player sprite scale', () => {
  test('uses 1x base scale for player textures', ({ assert }) => {
    assert.equal(getPlayerBaseScale(16), 1)
    assert.equal(getPlayerBaseScale(32), 1)
  })

  test('keeps base scale when flipping direction', ({ assert }) => {
    assert.equal(getSpriteScaleForDirection('right', 2), 2)
    assert.equal(getSpriteScaleForDirection('left', 2), -2)
    assert.equal(getSpriteScaleForDirection('left', 1), -1)
  })
})
