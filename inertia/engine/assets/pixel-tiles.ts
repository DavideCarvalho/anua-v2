/**
 * Programmatically generated pixel-art tile textures for indoor scenes.
 *
 * Each tile is 16x16 pixels. Tile IDs match the TILE_COLORS mapping:
 *   1: Floor  (wooden planks with subtle grain)
 *   2: Wall   (stone/brick pattern)
 *   3: Door   (wooden door with handle)
 *   4: Counter (wooden counter/desk surface)
 *   5: Shelf  (bookshelf with books)
 *   6: Decoration (accent tile)
 *   7: Grass (overworld)
 *   8: Water (overworld)
 *
 * Design principles:
 *   - Coloured outlines (darkest shade, not pure black)
 *   - Top-left light source
 *   - Hard edges, no anti-aliasing
 *   - Patterns tile seamlessly where possible
 */

import { PALETTE, transparentPixel as _ } from './pixel-palette'
import { Texture } from 'pixi.js'
import { getExternalOverworldTexture, hasExternalOverworldTile } from './external-tiles'

const O = PALETTE.outline
const W0 = PALETTE.wood[0]
const W1 = PALETTE.wood[1]
const W2 = PALETTE.wood[2]
const W3 = PALETTE.wood[3]
const S0 = PALETTE.stone[0]
const S1 = PALETTE.stone[1]
const S2 = PALETTE.stone[2]
const G0 = PALETTE.gold[0]
const G1 = PALETTE.gold[1]
const RD = PALETTE.red
const BL = PALETTE.blue
const GR0 = PALETTE.grass[0]
const GR1 = PALETTE.grass[1]
const GR2 = PALETTE.grass[2]
const WT0 = PALETTE.water[0]
const WT1 = PALETTE.water[1]
const WT2 = PALETTE.water[2]
const WT3 = PALETTE.water[3]

const TILE_SIZE = 16

// ─── Floor tile (wooden planks) ─────────────────────────────────────
// Horizontal wooden planks with grain lines and subtle colour variation.
// prettier-ignore
const FLOOR_TILE: number[][] = [
  [W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0],
  [W0, W0, W1, W0, W0, W0, W0, W0, W0, W0, W1, W0, W0, W0, W0, W0],
  [W0, W0, W0, W0, W0, W0, W1, W0, W0, W0, W0, W0, W0, W0, W0, W0],
  [W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W1, W0, W0],
  [W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1],
  [W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0],
  [W0, W0, W0, W0, W0, W1, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0],
  [W0, W0, W0, W0, W0, W0, W0, W0, W0, W1, W0, W0, W0, W0, W0, W0],
  [W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0],
  [W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1],
  [W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0],
  [W0, W0, W0, W1, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W1, W0],
  [W0, W0, W0, W0, W0, W0, W0, W0, W1, W0, W0, W0, W0, W0, W0, W0],
  [W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0],
  [W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1],
  [W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0],
]

// ─── Wall tile (stone bricks) ──────────────────────────────────────
// Brick pattern with mortar lines.
// prettier-ignore
const WALL_TILE: number[][] = [
  [S2, S1, S1, S1, S1, S1, S1, S2, S2, S1, S1, S1, S1, S1, S1, S2],
  [S2, S1, S0, S0, S0, S0, S1, S2, S2, S1, S0, S0, S0, S0, S1, S2],
  [S2, S1, S0, S0, S0, S0, S1, S2, S2, S1, S0, S0, S0, S0, S1, S2],
  [S2, S1, S1, S1, S1, S1, S1, S2, S2, S1, S1, S1, S1, S1, S1, S2],
  [S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2],
  [S1, S1, S1, S2, S2, S1, S1, S1, S1, S1, S1, S2, S2, S1, S1, S1],
  [S0, S0, S1, S2, S2, S1, S0, S0, S0, S0, S1, S2, S2, S1, S0, S0],
  [S0, S0, S1, S2, S2, S1, S0, S0, S0, S0, S1, S2, S2, S1, S0, S0],
  [S1, S1, S1, S2, S2, S1, S1, S1, S1, S1, S1, S2, S2, S1, S1, S1],
  [S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2],
  [S2, S1, S1, S1, S1, S1, S1, S2, S2, S1, S1, S1, S1, S1, S1, S2],
  [S2, S1, S0, S0, S0, S0, S1, S2, S2, S1, S0, S0, S0, S0, S1, S2],
  [S2, S1, S0, S0, S0, S0, S1, S2, S2, S1, S0, S0, S0, S0, S1, S2],
  [S2, S1, S1, S1, S1, S1, S1, S2, S2, S1, S1, S1, S1, S1, S1, S2],
  [S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2, S2],
  [S1, S1, S1, S2, S2, S1, S1, S1, S1, S1, S1, S2, S2, S1, S1, S1],
]

// ─── Door tile ─────────────────────────────────────────────────────
// Wooden door with darker frame and a gold handle.
// prettier-ignore
const DOOR_TILE: number[][] = [
  [W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3],
  [W3, W2, W1, W1, W1, W1, W1, W2, W2, W1, W1, W1, W1, W1, W2, W3],
  [W3, W1, W0, W0, W0, W0, W0, W1, W1, W0, W0, W0, W0, W0, W1, W3],
  [W3, W1, W0, W0, W0, W0, W0, W1, W1, W0, W0, W0, W0, W0, W1, W3],
  [W3, W1, W0, W0, W0, W0, W0, W1, W1, W0, W0, W0, W0, W0, W1, W3],
  [W3, W1, W0, W0, W0, W0, W0, W1, W1, W0, W0, W0, W0, W0, W1, W3],
  [W3, W1, W0, W0, W0, W0, W0, W1, W1, W0, W0, W0, W0, W0, W1, W3],
  [W3, W2, W1, W1, W1, W1, W1, W2, W2, W1, G0, G1, W1, W1, W2, W3],
  [W3, W2, W1, W1, W1, W1, W1, W2, W2, W1, G1, G0, W1, W1, W2, W3],
  [W3, W1, W0, W0, W0, W0, W0, W1, W1, W0, W0, W0, W0, W0, W1, W3],
  [W3, W1, W0, W0, W0, W0, W0, W1, W1, W0, W0, W0, W0, W0, W1, W3],
  [W3, W1, W0, W0, W0, W0, W0, W1, W1, W0, W0, W0, W0, W0, W1, W3],
  [W3, W1, W0, W0, W0, W0, W0, W1, W1, W0, W0, W0, W0, W0, W1, W3],
  [W3, W1, W0, W0, W0, W0, W0, W1, W1, W0, W0, W0, W0, W0, W1, W3],
  [W3, W2, W1, W1, W1, W1, W1, W2, W2, W1, W1, W1, W1, W1, W2, W3],
  [W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3],
]

// ─── Counter tile ──────────────────────────────────────────────────
// Wooden counter/desk top view with edge grain.
// prettier-ignore
const COUNTER_TILE: number[][] = [
  [W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3],
  [W3, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W3],
  [W3, W2, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W2, W3],
  [W3, W2, W1, W0, W0, W0, W1, W0, W0, W0, W1, W0, W0, W1, W2, W3],
  [W3, W2, W1, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W1, W2, W3],
  [W3, W2, W1, W0, W0, W0, W0, W0, W0, W1, W0, W0, W0, W1, W2, W3],
  [W3, W2, W1, W0, W0, W1, W0, W0, W0, W0, W0, W0, W0, W1, W2, W3],
  [W3, W2, W1, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W1, W2, W3],
  [W3, W2, W1, W0, W0, W0, W0, W0, W1, W0, W0, W0, W0, W1, W2, W3],
  [W3, W2, W1, W0, W0, W0, W0, W0, W0, W0, W0, W1, W0, W1, W2, W3],
  [W3, W2, W1, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W1, W2, W3],
  [W3, W2, W1, W0, W1, W0, W0, W0, W0, W0, W0, W0, W0, W1, W2, W3],
  [W3, W2, W1, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W1, W2, W3],
  [W3, W2, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W2, W3],
  [W3, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W3],
  [W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3],
]

// ─── Shelf tile (bookshelf) ────────────────────────────────────────
// Bookshelf with coloured book spines.
// prettier-ignore
const SHELF_TILE: number[][] = [
  [W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3],
  [W3, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W3],
  [W3, RD, RD, BL, BL, GR1,GR1, W1, RD, RD, BL, G1, G1, W1, W1, W3],
  [W3, RD, RD, BL, BL, GR1,GR1, W1, RD, RD, BL, G1, G1, W1, W1, W3],
  [W3, RD, RD, BL, BL, GR1,GR1, W1, RD, RD, BL, G1, G1, W1, W1, W3],
  [W3, RD, RD, BL, BL, GR1,GR1, W1, RD, RD, BL, G1, G1, W1, W1, W3],
  [W3, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W3],
  [W3, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W3],
  [W3, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W3],
  [W3, BL, BL, G1, G1, RD, RD, W1, W1, BL, BL, GR1,GR1, RD, RD, W3],
  [W3, BL, BL, G1, G1, RD, RD, W1, W1, BL, BL, GR1,GR1, RD, RD, W3],
  [W3, BL, BL, G1, G1, RD, RD, W1, W1, BL, BL, GR1,GR1, RD, RD, W3],
  [W3, BL, BL, G1, G1, RD, RD, W1, W1, BL, BL, GR1,GR1, RD, RD, W3],
  [W3, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W3],
  [W3, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W3],
  [W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3],
]

// ─── Decoration tile (accent) ──────────────────────────────────────
// Simple decorative pattern - a small rug/carpet.
// prettier-ignore
const DECORATION_TILE: number[][] = [
  [W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0],
  [W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0],
  [W0, W0, O, O, O, O, O, O, O, O, O, O, O, O, W0, W0],
  [W0, W0, O, RD, RD, G1, G1, G1, G1, G1, G1, RD, RD, O, W0, W0],
  [W0, W0, O, RD, G1, G0, G0, G0, G0, G0, G0, G1, RD, O, W0, W0],
  [W0, W0, O, G1, G0, G0, RD, G0, G0, RD, G0, G0, G1, O, W0, W0],
  [W0, W0, O, G1, G0, RD, RD, RD, RD, RD, RD, G0, G1, O, W0, W0],
  [W0, W0, O, G1, G0, G0, RD, G0, G0, RD, G0, G0, G1, O, W0, W0],
  [W0, W0, O, G1, G0, G0, RD, G0, G0, RD, G0, G0, G1, O, W0, W0],
  [W0, W0, O, G1, G0, RD, RD, RD, RD, RD, RD, G0, G1, O, W0, W0],
  [W0, W0, O, G1, G0, G0, RD, G0, G0, RD, G0, G0, G1, O, W0, W0],
  [W0, W0, O, RD, G1, G0, G0, G0, G0, G0, G0, G1, RD, O, W0, W0],
  [W0, W0, O, RD, RD, G1, G1, G1, G1, G1, G1, RD, RD, O, W0, W0],
  [W0, W0, O, O, O, O, O, O, O, O, O, O, O, O, W0, W0],
  [W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0],
  [W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0],
]

// ─── Grass tile (overworld) ─────────────────────────────────────────
// Classic 2D pixel-art grass with subtle colour variation. Tiles seamlessly.
// prettier-ignore
const GRASS_TILE: number[][] = [
  [GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1],
  [GR1, GR0, GR1, GR0, GR1, GR2, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0],
  [GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR2, GR0, GR1, GR0, GR1],
  [GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0],
  [GR0, GR1, GR0, GR2, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1],
  [GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR2, GR0],
  [GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1],
  [GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0],
  [GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR2, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1],
  [GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0],
  [GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR2, GR0, GR1],
  [GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0],
  [GR0, GR1, GR0, GR1, GR0, GR2, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1],
  [GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0],
  [GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1],
  [GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0, GR1, GR0],
]

// ─── Water tile (overworld) ─────────────────────────────────────────
// Wave pattern with depth and highlight for reflection. Tiles seamlessly.
// prettier-ignore
const WATER_TILE: number[][] = [
  [WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2],
  [WT2, WT1, WT2, WT1, WT2, WT0, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1],
  [WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT0, WT1, WT2],
  [WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT3, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1],
  [WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2],
  [WT2, WT1, WT2, WT0, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1],
  [WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2],
  [WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT3, WT2, WT1, WT2, WT1, WT2, WT1],
  [WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2],
  [WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT0, WT2, WT1, WT2, WT1],
  [WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2],
  [WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT3, WT2, WT1],
  [WT1, WT2, WT1, WT2, WT1, WT0, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2],
  [WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1],
  [WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2],
  [WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1, WT2, WT1],
]

// ─── Tile data map ─────────────────────────────────────────────────

/** Map of tile IDs to their pixel data arrays. */
const TILE_PIXELS: Record<number, number[][]> = {
  1: FLOOR_TILE,
  2: WALL_TILE,
  3: DOOR_TILE,
  4: COUNTER_TILE,
  5: SHELF_TILE,
  6: DECORATION_TILE,
  7: GRASS_TILE,
  8: WATER_TILE,
}

/** Overworld tile ID -> internal texture ID. 1=grass, 2=water. */
const OVERWORLD_TILE_MAP: Record<number, number> = {
  1: 7, // grass
  2: 8, // water
}

// ─── Canvas / Texture generation ────────────────────────────────────

/**
 * Render pixel data to a canvas.
 */
function renderPixelData(pixelData: number[][], width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.createImageData(width, height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = pixelData[y]?.[x] ?? 0
      if (color === 0) continue
      const i = (y * width + x) * 4
      imageData.data[i] = (color >> 16) & 0xff
      imageData.data[i + 1] = (color >> 8) & 0xff
      imageData.data[i + 2] = color & 0xff
      imageData.data[i + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

/** Cached textures (tile ID -> Texture). */
let tileTextureCache: Record<number, Texture> | null = null

/**
 * Get a PixiJS Texture for the given tile ID.
 * Returns null if no pixel data exists for that ID (e.g. tile 0 = transparent).
 * Textures are cached after first generation.
 */
export function getTileTexture(tileId: number): Texture | null {
  if (!tileTextureCache) {
    tileTextureCache = {}
  }

  if (tileTextureCache[tileId]) return tileTextureCache[tileId]

  const pixels = TILE_PIXELS[tileId]
  if (!pixels) return null

  const canvas = renderPixelData(pixels, TILE_SIZE, TILE_SIZE)
  const texture = Texture.from(canvas)
  tileTextureCache[tileId] = texture
  return texture
}

/**
 * Check whether pixel tile textures are available for a given tile ID.
 */
export function hasPixelTile(tileId: number): boolean {
  return tileId in TILE_PIXELS
}

/**
 * Get a PixiJS Texture for overworld tile IDs (1=grass, 2=water).
 * Pass tileX,tileY for grass middle variety; autotileIndex for edge/corner selection.
 */
export function getOverworldTileTexture(
  tileId: number,
  tileX?: number,
  tileY?: number,
  autotileIndex?: number
): Texture | null {
  if (hasExternalOverworldTile(tileId)) {
    const tex = getExternalOverworldTexture(tileId, tileX, tileY, autotileIndex)
    if (tex) return tex
  }
  const internalId = OVERWORLD_TILE_MAP[tileId]
  return internalId !== null && internalId !== undefined ? getTileTexture(internalId) : null
}

/**
 * Check whether pixel tile textures are available for a given overworld tile ID.
 */
export function hasOverworldPixelTile(tileId: number): boolean {
  if (hasExternalOverworldTile(tileId)) return true
  return tileId in OVERWORLD_TILE_MAP
}

export { TILE_SIZE as PIXEL_TILE_SIZE }
