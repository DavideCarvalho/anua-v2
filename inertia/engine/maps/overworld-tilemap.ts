import type { TileMapData, InteractionZoneDef } from './map-types'

const W = 2 // water (impassable)
const G = 1 // grass (walkable)
const P = 3 // path (walkable)

const WIDTH = 40
const HEIGHT = 25
const TILE_SIZE = 16
const WALKABLE_GROUND_IDS = new Set([G, P])

function toIndex(x: number, y: number): number {
  return y * WIDTH + x
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

function paintPathDot(ground: number[], cx: number, cy: number, radius: number): void {
  const minX = Math.max(0, Math.floor(cx - radius))
  const maxX = Math.min(WIDTH - 1, Math.ceil(cx + radius))
  const minY = Math.max(0, Math.floor(cy - radius))
  const maxY = Math.min(HEIGHT - 1, Math.ceil(cy + radius))

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (dist(x, y, cx, cy) > radius + 0.15) continue
      const i = toIndex(x, y)
      if (ground[i] === G || ground[i] === P) {
        ground[i] = P
      }
    }
  }
}

function paintGrassDot(ground: number[], cx: number, cy: number, radius: number): void {
  const minX = Math.max(0, Math.floor(cx - radius))
  const maxX = Math.min(WIDTH - 1, Math.ceil(cx + radius))
  const minY = Math.max(0, Math.floor(cy - radius))
  const maxY = Math.min(HEIGHT - 1, Math.ceil(cy + radius))

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (dist(x, y, cx, cy) > radius + 0.15) continue
      ground[toIndex(x, y)] = G
    }
  }
}

function paintPathPolyline(
  ground: number[],
  points: Array<{ x: number; y: number }>,
  width: number
): void {
  for (let p = 0; p < points.length - 1; p++) {
    const from = points[p]
    const to = points[p + 1]
    const steps = Math.max(1, Math.ceil(dist(from.x, from.y, to.x, to.y) * 4))
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = from.x + (to.x - from.x) * t
      const y = from.y + (to.y - from.y) * t
      paintPathDot(ground, x, y, width)
    }
  }
}

function shouldBeLand(x: number, y: number): boolean {
  const cx = 19.5
  const cy = 12.2
  const rx = 16.8
  const ry = 11.5
  const nx = (x - cx) / rx
  const ny = (y - cy) / ry
  const radial = Math.sqrt(nx * nx + ny * ny)

  const coastNoise =
    Math.sin((x + 1.7) * 0.62) * 0.06 +
    Math.cos((y - 2.3) * 0.9) * 0.05 +
    Math.sin((x + y) * 0.35) * 0.03

  const topLeftInlet = dist(x, y, 9.8, 7.0) < 3.2 ? 0.12 : 0
  const lowerRightInlet = dist(x, y, 31.3, 17.8) < 2.8 ? 0.1 : 0
  const upperRightInlet = dist(x, y, 30.7, 5.5) < 2.2 ? 0.08 : 0

  const threshold = 1 + coastNoise - topLeftInlet - lowerRightInlet - upperRightInlet
  return radial <= threshold
}

function smoothLand(land: boolean[]): boolean[] {
  const copy = [...land]
  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      const i = toIndex(x, y)
      let neighbors = 0
      if (land[toIndex(x + 1, y)]) neighbors++
      if (land[toIndex(x - 1, y)]) neighbors++
      if (land[toIndex(x, y + 1)]) neighbors++
      if (land[toIndex(x, y - 1)]) neighbors++

      if (land[i] && neighbors <= 1) copy[i] = false
      if (!land[i] && neighbors >= 4) copy[i] = true
    }
  }
  return copy
}

function buildOverworldLayers(): TileMapData['layers'] {
  const ground = Array(WIDTH * HEIGHT).fill(W)
  const walls = Array(WIDTH * HEIGHT).fill(W)
  let land = Array(WIDTH * HEIGHT).fill(false)

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      land[toIndex(x, y)] = shouldBeLand(x, y)
    }
  }
  land = smoothLand(land)

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (!land[toIndex(x, y)]) continue
      ground[toIndex(x, y)] = G
    }
  }

  // Guarantee walkable clearings for hub and interactive anchors.
  paintGrassDot(ground, SPAWN_TILES.x, SPAWN_TILES.y, 1.5)
  for (const zone of ZONE_TILES) {
    paintGrassDot(ground, zone.tileX, zone.tileY, 1.25)
  }

  // Organic village path network: central plaza + curved trunk + branches.
  paintPathDot(ground, SPAWN_TILES.x, SPAWN_TILES.y, 2.25)
  paintPathPolyline(
    ground,
    [
      { x: 11.5, y: 13.5 },
      { x: 15.5, y: 11.6 },
      { x: 20.5, y: 12.1 },
      { x: 25.5, y: 12.8 },
      { x: 29.2, y: 14.0 },
    ],
    1.05
  )
  paintPathPolyline(
    ground,
    [
      { x: 20.1, y: 11.2 },
      { x: 18.3, y: 9.2 },
      { x: 15.7, y: 7.6 },
      { x: 12.0, y: 6.0 },
    ],
    0.95
  )
  paintPathPolyline(
    ground,
    [
      { x: 20.6, y: 11.3 },
      { x: 23.0, y: 9.2 },
      { x: 26.2, y: 7.3 },
      { x: 28.0, y: 6.0 },
    ],
    0.95
  )
  paintPathPolyline(
    ground,
    [
      { x: 23.8, y: 13.2 },
      { x: 25.6, y: 14.5 },
      { x: 27.0, y: 15.2 },
      { x: 28.0, y: 16.0 },
    ],
    0.95
  )

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (ground[toIndex(x, y)] === W) continue
      walls[toIndex(x, y)] = 0
    }
  }

  return {
    ground,
    walls,
    objects: Array(WIDTH * HEIGHT).fill(0),
  }
}

/** Convert tile coords to pixel position (center of tile). */
function tileToPixel(tileX: number, tileY: number): { x: number; y: number } {
  return {
    x: (tileX + 0.5) * TILE_SIZE,
    y: (tileY + 0.5) * TILE_SIZE,
  }
}

/** Zone definitions in tile coords (see overworld-map-design.md). */
const ZONE_TILES: Array<{
  id: string
  tileX: number
  tileY: number
  label: string
  href: string
  radius: number
  color: number
  width: number
  height: number
}> = [
  {
    id: 'treasure',
    tileX: 12,
    tileY: 6,
    label: 'Baú de Tesouros',
    href: '/aluno/loja/pontos',
    radius: 40,
    color: 0xf5a623,
    width: 28,
    height: 24,
  },
  {
    id: 'market',
    tileX: 28,
    tileY: 6,
    label: 'Mercadinho',
    href: '/aluno/loja',
    radius: 40,
    color: 0x4caf50,
    width: 32,
    height: 28,
  },
  {
    id: 'mailbox',
    tileX: 28,
    tileY: 16,
    label: 'Correio',
    href: '/aluno/loja/pedidos',
    radius: 40,
    color: 0x5b8def,
    width: 20,
    height: 28,
  },
]

const SPAWN_TILES = { x: 20, y: 12 }

/** Build interaction zones with position derived from tile coords. */
function buildInteractionZones(): InteractionZoneDef[] {
  return ZONE_TILES.map((z) => ({
    id: z.id,
    label: z.label,
    href: z.href,
    position: tileToPixel(z.tileX, z.tileY),
    radius: z.radius,
    color: z.color,
    width: z.width,
    height: z.height,
  }))
}

/**
 * Overworld tilemap — Pokemon/Gather style, larger explorable world.
 *
 * 40x25 tiles, 16px each = 640x400 world.
 * Viewport shows 400x300; camera follows player.
 * Design: inertia/engine/maps/overworld-map-design.md
 */
export const OVERWORLD_TILEMAP: TileMapData = {
  width: WIDTH,
  height: HEIGHT,
  tileSize: TILE_SIZE,
  layers: buildOverworldLayers(),
  doors: [],
  interactionZones: buildInteractionZones(),
  playerSpawn: SPAWN_TILES,
}

// ─── Validation (dev-time) ────────────────────────────────────────────────

function validateOverworldZones(): void {
  const { ground } = OVERWORLD_TILEMAP.layers
  for (const z of ZONE_TILES) {
    const idx = z.tileY * WIDTH + z.tileX
    if (!WALKABLE_GROUND_IDS.has(ground[idx])) {
      throw new Error(
        `[overworld] Zone "${z.id}" at tile (${z.tileX},${z.tileY}) is on water. ` +
          `ground[${idx}]=${ground[idx]}, expected one of ${Array.from(WALKABLE_GROUND_IDS).join(',')}.`
      )
    }
  }
  const spawnIdx = SPAWN_TILES.y * WIDTH + SPAWN_TILES.x
  if (!WALKABLE_GROUND_IDS.has(ground[spawnIdx])) {
    throw new Error(
      `[overworld] Player spawn at tile (${SPAWN_TILES.x},${SPAWN_TILES.y}) is on water. ` +
        `ground[${spawnIdx}]=${ground[spawnIdx]}, expected one of ${Array.from(WALKABLE_GROUND_IDS).join(',')}.`
    )
  }
}

validateOverworldZones()
