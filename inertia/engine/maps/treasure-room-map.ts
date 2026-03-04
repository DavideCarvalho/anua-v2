import type { TileMapData } from './map-types'

// prettier-ignore
const W = 2 // wall
// prettier-ignore
const F = 1 // floor
// prettier-ignore
const D = 3 // door
// prettier-ignore
const C = 4 // counter
// prettier-ignore
const S = 5 // shelf

/**
 * Treasure Room (Baú de Tesouros) — 12x10 tilemap.
 *
 * Theme: Golden/warm. Counter at top-center, shelves along walls.
 */
export const TREASURE_ROOM_MAP: TileMapData = {
  width: 12,
  height: 10,
  tileSize: 32,
  layers: {
    // prettier-ignore
    ground: [
      F, F, F, F, F, F, F, F, F, F, F, F,
      F, F, F, F, F, F, F, F, F, F, F, F,
      F, F, F, F, F, F, F, F, F, F, F, F,
      F, F, F, F, F, F, F, F, F, F, F, F,
      F, F, F, F, F, F, F, F, F, F, F, F,
      F, F, F, F, F, F, F, F, F, F, F, F,
      F, F, F, F, F, F, F, F, F, F, F, F,
      F, F, F, F, F, F, F, F, F, F, F, F,
      F, F, F, F, F, F, F, F, F, F, F, F,
      F, F, F, F, F, F, F, F, F, F, F, F,
    ],
    // prettier-ignore
    walls: [
      W, W, W, W, W, W, W, W, W, W, W, W,
      W, W, W, W, W, W, W, W, W, W, W, W,
      W, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, W,
      W, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, W,
      W, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, W,
      W, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, W,
      W, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, W,
      W, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, W,
      W, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, W,
      W, W, W, W, W, 0, 0, W, W, W, W, W,
    ],
    // prettier-ignore
    objects: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, S, 0, 0, C, C, C, C, 0, 0, S, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, S, 0, 0, 0, 0, 0, 0, 0, 0, S, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, S, 0, 0, 0, 0, 0, 0, 0, 0, S, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, D, D, 0, 0, 0, 0, 0,
    ],
  },
  doors: [
    { tileX: 5, tileY: 9, targetScene: 'overworld' },
    { tileX: 6, tileY: 9, targetScene: 'overworld' },
  ],
  interactionZones: [
    {
      id: 'treasure-counter',
      label: 'Abrir Baú',
      href: '/aluno/loja/pontos',
      position: { x: 5.5 * 32, y: 2 * 32 },
      radius: 40,
      color: 0xf5a623,
      width: 28,
      height: 24,
    },
  ],
  playerSpawn: { x: 5, y: 8 },
}
