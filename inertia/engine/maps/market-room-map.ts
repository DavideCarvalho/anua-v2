import type { TileMapData } from './map-types'

const W = 2 // wall
const F = 1 // floor
const D = 3 // door
const C = 4 // counter
const S = 5 // shelf

/**
 * Market Room (Mercadinho) — 12x10 tilemap.
 *
 * Theme: Green/market. Counter at top-center, shelves along sides.
 */
export const MARKET_ROOM_MAP: TileMapData = {
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
      0, S, S, 0, C, C, C, C, 0, S, S, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, S, 0, 0, 0, 0, 0, 0, 0, 0, S, 0,
      0, S, 0, 0, 0, 0, 0, 0, 0, 0, S, 0,
      0, S, 0, 0, 0, 0, 0, 0, 0, 0, S, 0,
      0, S, 0, 0, 0, 0, 0, 0, 0, 0, S, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
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
      id: 'market-counter',
      label: 'Ver Produtos',
      href: '/aluno/loja',
      position: { x: 5.5 * 32, y: 2 * 32 },
      radius: 40,
      color: 0x4caf50,
      width: 32,
      height: 28,
    },
  ],
  playerSpawn: { x: 5, y: 8 },
}
