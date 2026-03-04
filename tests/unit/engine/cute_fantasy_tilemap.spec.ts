import { test } from '@japa/runner'

import {
  buildOverworldTileDebugSnapshot,
  getGrassMiddleFrameCoords,
  pickGrassMiddleVariantIndex,
  getGrassAutotileIndex,
  getBeachAutotileIndex,
  shouldUseExternalGrass,
} from '../../../inertia/engine/assets/cute-fantasy-tilemap.js'

test.group('cute fantasy tilemap', () => {
  test('uses grass-only middle frame coordinates', ({ assert }) => {
    assert.deepEqual(getGrassMiddleFrameCoords(), [
      [5, 9],
      [6, 9],
      [7, 9],
      [3, 7],
    ])
  })

  test('always renders grass with middle autotile index', ({ assert }) => {
    assert.equal(getGrassAutotileIndex(0), 0)
    assert.equal(getGrassAutotileIndex(1), 0)
    assert.equal(getGrassAutotileIndex(7), 0)
    assert.equal(getGrassAutotileIndex(15), 0)
  })

  test('selects grass middle variants in stable 2x2 clusters and avoids extreme brightness', ({
    assert,
  }) => {
    assert.equal(pickGrassMiddleVariantIndex(0, 0, 4), pickGrassMiddleVariantIndex(1, 0, 4))
    assert.equal(pickGrassMiddleVariantIndex(0, 0, 4), pickGrassMiddleVariantIndex(0, 1, 4))
    assert.equal(pickGrassMiddleVariantIndex(0, 0, 4), pickGrassMiddleVariantIndex(1, 1, 4))

    const variants = new Set<number>()
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 12; x++) {
        variants.add(pickGrassMiddleVariantIndex(x, y, 4))
      }
    }

    assert.deepEqual(
      Array.from(variants).sort((a, b) => a - b),
      [1, 2]
    )
  })

  test('keeps beach autotile cardinal directions aligned with bitmask orientation', ({
    assert,
  }) => {
    assert.equal(getBeachAutotileIndex(0), 0)
    assert.equal(getBeachAutotileIndex(1), 1)
    assert.equal(getBeachAutotileIndex(2), 2)
    assert.equal(getBeachAutotileIndex(4), 4)
    assert.equal(getBeachAutotileIndex(8), 8)
    assert.equal(getBeachAutotileIndex(3), 3)
    assert.equal(getBeachAutotileIndex(12), 12)
    assert.equal(getBeachAutotileIndex(15), 15)
  })

  test('keeps external grass enabled', ({ assert }) => {
    assert.isTrue(shouldUseExternalGrass())
  })

  test('builds deterministic debug snapshot for mixed grass and water', ({ assert }) => {
    const snapshot = buildOverworldTileDebugSnapshot({
      width: 3,
      height: 3,
      ground: [2, 2, 2, 2, 1, 2, 2, 2, 2],
    })

    assert.equal(snapshot.width, 3)
    assert.equal(snapshot.height, 3)
    assert.equal(snapshot.counts['grass-middle-external'], 1)
    assert.equal(snapshot.counts['beach-edge'], 4)
    assert.equal(snapshot.counts['water-middle'], 4)

    const center = snapshot.cells.find((cell) => cell.x === 1 && cell.y === 1)
    assert.exists(center)
    assert.equal(center!.asset, 'grass-middle-external')
    assert.equal(center!.autotileIndex, 15)
    assert.equal(center!.resolvedAutotileIndex, 0)

    const topWater = snapshot.cells.find((cell) => cell.x === 1 && cell.y === 0)
    assert.exists(topWater)
    assert.equal(topWater!.asset, 'beach-edge')
    assert.equal(topWater!.autotileIndex, 4)
    assert.equal(topWater!.resolvedAutotileIndex, 4)
    assert.deepEqual(topWater!.frame, { col: 4, row: 0 })
  })

  test('tracks path tiles in debug snapshot', ({ assert }) => {
    const snapshot = buildOverworldTileDebugSnapshot({
      width: 2,
      height: 2,
      ground: [3, 1, 2, 3],
    })

    assert.equal(snapshot.counts['path-tile'], 2)
    const pathCell = snapshot.cells.find((cell) => cell.x === 0 && cell.y === 0)
    assert.exists(pathCell)
    assert.equal(pathCell!.asset, 'path-tile')
    assert.deepEqual(pathCell!.frame, { col: 0, row: 0 })
  })
})
