/**
 * Cute Fantasy autotile mapping.
 *
 * Bitmask: 8 neighbors, water=1. Order: N, NE, E, SE, S, SW, W, NW.
 * We use 4 cardinal (N,E,S,W) for 16-tile layout; diagonals folded into corners.
 *
 * Grass_Tiles: 256x160 = 16 cols x 10 rows. Standard 16-tile autotile:
 *   Index 0: middle (no water)
 *   1-8: edges (N, E, S, W) and corners (NE, SE, SW, NW)
 *   9-15: combinations
 *
 * Beach_Tiles: 480x48 = 30 cols x 3 rows. Water-edge (land visible from water).
 */

/** Cardinal bits: N=1, E=2, S=4, W=8 */
export const BIT_N = 1
export const BIT_E = 2
export const BIT_S = 4
export const BIT_W = 8

/** Diagonal bits: NE=16, SE=32, SW=64, NW=128 */
export const BIT_NE = 16
export const BIT_SE = 32
export const BIT_SW = 64
export const BIT_NW = 128

/** Build 8-neighbor bitmask. isWater(tileId) => true for water. */
export function buildBitmask(
  getTile: (x: number, y: number) => number,
  cx: number,
  cy: number,
  isWater: (id: number) => boolean
): number {
  let mask = 0
  const dirs: [number, number, number][] = [
    [0, -1, BIT_N],
    [1, -1, BIT_NE],
    [1, 0, BIT_E],
    [1, 1, BIT_SE],
    [0, 1, BIT_S],
    [-1, 1, BIT_SW],
    [-1, 0, BIT_W],
    [-1, -1, BIT_NW],
  ]
  for (const [dx, dy, bit] of dirs) {
    const id = getTile(cx + dx, cy + dy)
    if (isWater(id)) mask |= bit
  }
  return mask
}

/** 16-tile autotile index from 8-neighbor bitmask. Collapses diagonals into corners. */
export function bitmaskTo16Index(mask: number): number {
  const N = (mask & BIT_N) !== 0 ? 1 : 0
  const E = (mask & BIT_E) !== 0 ? 1 : 0
  const S = (mask & BIT_S) !== 0 ? 1 : 0
  const W = (mask & BIT_W) !== 0 ? 1 : 0
  // Standard 16-tile: 4 cardinal bits -> index 0-15
  const c = (N << 0) | (E << 1) | (S << 2) | (W << 3)
  return c
}

const GRASS_MIDDLE_FRAME_COORDS: [number, number][] = [
  [5, 9],
  [6, 9],
  [7, 9],
  [3, 7],
]

export function getGrassMiddleFrameCoords(): [number, number][] {
  return GRASS_MIDDLE_FRAME_COORDS
}

/**
 * Choose grass middle variant with low-frequency clustering.
 * Uses 2x2 tile cells and avoids darkest/brightest sheets for smoother ground.
 */
export function pickGrassMiddleVariantIndex(
  tileX: number,
  tileY: number,
  variantCount: number
): number {
  if (variantCount <= 0) return 0
  if (variantCount === 1) return 0

  const clusterX = Math.floor(tileX / 2)
  const clusterY = Math.floor(tileY / 2)
  const noise = Math.abs(Math.sin(clusterX * 1.73 + clusterY * 2.41))

  // Prefer middle brightness variants when available.
  if (variantCount >= 4) {
    return noise < 0.5 ? 1 : 2
  }

  return Math.floor(noise * variantCount)
}

/**
 * Current Cute Fantasy set does not provide clean grass shoreline autotiles.
 * Keep grass as middle variants and let water/beach tiles draw the shore.
 */
export function getGrassAutotileIndex(_autotileIndex: number): number {
  return 0
}

/**
 * Cute Fantasy grass atlas cells currently available in this project include
 * shoreline artifacts when sampled on a 16x16 grid. Use internal grass tile.
 */
export function shouldUseExternalGrass(): boolean {
  return true
}

export type OverworldDebugAssetType =
  | 'none'
  | 'grass-middle-external'
  | 'grass-edge-external'
  | 'grass-internal-fallback'
  | 'water-middle'
  | 'beach-edge'
  | 'path-tile'

export interface OverworldTileDebugCell {
  x: number
  y: number
  tileId: number
  bitmask: number
  autotileIndex: number
  resolvedAutotileIndex: number
  asset: OverworldDebugAssetType
  frame: { col: number; row: number } | null
}

export interface OverworldTileDebugSnapshot {
  width: number
  height: number
  counts: Record<OverworldDebugAssetType, number>
  cells: OverworldTileDebugCell[]
}

export function buildOverworldTileDebugSnapshot(input: {
  width: number
  height: number
  ground: number[]
}): OverworldTileDebugSnapshot {
  const getTile = (x: number, y: number): number => {
    if (x < 0 || x >= input.width || y < 0 || y >= input.height) return 0
    return input.ground[y * input.width + x] ?? 0
  }

  const cells: OverworldTileDebugCell[] = []
  const counts: Record<OverworldDebugAssetType, number> = {
    'none': 0,
    'grass-middle-external': 0,
    'grass-edge-external': 0,
    'grass-internal-fallback': 0,
    'water-middle': 0,
    'beach-edge': 0,
    'path-tile': 0,
  }

  for (let y = 0; y < input.height; y++) {
    for (let x = 0; x < input.width; x++) {
      const tileId = getTile(x, y)

      if (tileId === 0) {
        counts.none += 1
        cells.push({
          x,
          y,
          tileId,
          bitmask: 0,
          autotileIndex: 0,
          resolvedAutotileIndex: 0,
          asset: 'none',
          frame: null,
        })
        continue
      }

      const isBorderFor = tileId === 1 ? (id: number) => id === 2 : (id: number) => id === 1
      const bitmask = buildBitmask(getTile, x, y, isBorderFor)
      const autotileIndex = bitmaskTo16Index(bitmask)

      if (tileId === 1) {
        if (!shouldUseExternalGrass()) {
          counts['grass-internal-fallback'] += 1
          cells.push({
            x,
            y,
            tileId,
            bitmask,
            autotileIndex,
            resolvedAutotileIndex: 0,
            asset: 'grass-internal-fallback',
            frame: null,
          })
          continue
        }

        const resolved = getGrassAutotileIndex(autotileIndex)
        const frame = GRASS_16_LAYOUT[resolved] ?? null
        const asset: OverworldDebugAssetType =
          resolved === 0 ? 'grass-middle-external' : 'grass-edge-external'
        counts[asset] += 1
        cells.push({
          x,
          y,
          tileId,
          bitmask,
          autotileIndex,
          resolvedAutotileIndex: resolved,
          asset,
          frame: frame ? { col: frame[0], row: frame[1] } : null,
        })
        continue
      }

      if (tileId === 2) {
        const resolved = getBeachAutotileIndex(autotileIndex)
        const frame = BEACH_16_LAYOUT[resolved] ?? null
        const asset: OverworldDebugAssetType = resolved === 0 ? 'water-middle' : 'beach-edge'
        counts[asset] += 1
        cells.push({
          x,
          y,
          tileId,
          bitmask,
          autotileIndex,
          resolvedAutotileIndex: resolved,
          asset,
          frame: frame ? { col: frame[0], row: frame[1] } : null,
        })
        continue
      }

      if (tileId === 3) {
        counts['path-tile'] += 1
        cells.push({
          x,
          y,
          tileId,
          bitmask: 0,
          autotileIndex: 0,
          resolvedAutotileIndex: 0,
          asset: 'path-tile',
          frame: { col: 0, row: 0 },
        })
        continue
      }

      counts.none += 1
      cells.push({
        x,
        y,
        tileId,
        bitmask,
        autotileIndex,
        resolvedAutotileIndex: 0,
        asset: 'none',
        frame: null,
      })
    }
  }

  return {
    width: input.width,
    height: input.height,
    counts,
    cells,
  }
}

/**
 * Beach sheet cardinal orientation is mirrored relative to our bitmask.
 * We remap N<->S and E<->W before selecting Beach_Tiles frame.
 */
export function getBeachAutotileIndex(autotileIndex: number): number {
  return autotileIndex & 0b1111
}

/** Grass_Tiles_1: (col, row) for 16-tile index. Row 0 = middle+edges, row 1 = more. */
export const GRASS_16_LAYOUT: [number, number][] = [
  [0, 0], // 0: middle
  [1, 0], // 1: N
  [2, 0], // 2: E
  [3, 0], // 3: N+E
  [4, 0], // 4: S
  [5, 0], // 5: N+S
  [6, 0], // 6: E+S
  [7, 0], // 7: N+E+S
  [8, 0], // 8: W
  [9, 0], // 9: N+W
  [10, 0], // 10: E+W
  [11, 0], // 11: N+E+W
  [12, 0], // 12: S+W
  [13, 0], // 13: N+S+W
  [14, 0], // 14: E+S+W
  [15, 0], // 15: N+E+S+W
]

/** Beach_Tiles: (col, row) for water-edge. Same 16 indices. */
export const BEACH_16_LAYOUT: [number, number][] = [
  [0, 0], // 0: water middle (fallback - use Water_Middle)
  [1, 0], // 1: N edge
  [2, 0], // 2: E edge
  [3, 0], // 3: N+E corner
  [4, 0], // 4: S edge
  [5, 0], // 5: N+S
  [6, 0], // 6: E+S corner
  [7, 0], // 7
  [8, 0], // 8: W edge
  [9, 0], // 9: N+W corner
  [10, 0], // 10: E+W
  [11, 0], // 11
  [12, 0], // 12: S+W corner
  [13, 0], // 13
  [14, 0], // 14
  [15, 0], // 15
]
