import { test } from '@japa/runner'

import { OVERWORLD_TILEMAP } from '../../../inertia/engine/maps/overworld-tilemap.js'

const WIDTH = OVERWORLD_TILEMAP.width
const HEIGHT = OVERWORLD_TILEMAP.height
const WALKABLE = new Set([1, 3])
const SPAWN = OVERWORLD_TILEMAP.playerSpawn
const ZONES = [
  { id: 'treasure', x: 12, y: 6 },
  { id: 'market', x: 28, y: 6 },
  { id: 'mailbox', x: 28, y: 16 },
]

function idx(x: number, y: number): number {
  return y * WIDTH + x
}

function isWalkableAt(x: number, y: number): boolean {
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return false
  return WALKABLE.has(OVERWORLD_TILEMAP.layers.ground[idx(x, y)] ?? 0)
}

function floodFromSpawn(): Set<string> {
  const visited = new Set<string>()
  const queue: Array<{ x: number; y: number }> = [{ x: SPAWN.x, y: SPAWN.y }]

  while (queue.length > 0) {
    const next = queue.shift()!
    const key = `${next.x},${next.y}`
    if (visited.has(key)) continue
    if (!isWalkableAt(next.x, next.y)) continue
    visited.add(key)

    queue.push({ x: next.x + 1, y: next.y })
    queue.push({ x: next.x - 1, y: next.y })
    queue.push({ x: next.x, y: next.y + 1 })
    queue.push({ x: next.x, y: next.y - 1 })
  }

  return visited
}

test.group('overworld map', () => {
  test('keeps island footprint large enough for village composition', ({ assert }) => {
    const walkableCount = OVERWORLD_TILEMAP.layers.ground.filter(
      (id) => id === 1 || id === 3
    ).length
    assert.isAbove(walkableCount, 520)
  })

  test('contains a path network for village layout', ({ assert }) => {
    const pathCount = OVERWORLD_TILEMAP.layers.ground.filter((id) => id === 3).length
    assert.isAbove(pathCount, 70)
  })

  test('keeps all interaction anchors connected to spawn via walkable tiles', ({ assert }) => {
    const reachable = floodFromSpawn()
    for (const zone of ZONES) {
      assert.isTrue(reachable.has(`${zone.x},${zone.y}`), `${zone.id} must be reachable from spawn`)
    }
  })

  test('has organic coastline width variation per row', ({ assert }) => {
    const widths = new Set<number>()
    const ground = OVERWORLD_TILEMAP.layers.ground

    for (let y = 0; y < HEIGHT; y++) {
      let minX = Number.POSITIVE_INFINITY
      let maxX = Number.NEGATIVE_INFINITY
      for (let x = 0; x < WIDTH; x++) {
        const tile = ground[idx(x, y)]
        if (tile === 1 || tile === 3) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
        }
      }
      if (minX !== Number.POSITIVE_INFINITY) {
        widths.add(maxX - minX + 1)
      }
    }

    assert.isAbove(widths.size, 6)
  })
})
