/**
 * Object sprites for the overworld.
 *
 * Prefers external Kenney tiles (see external-tiles.ts OBJECT_TILE_INDEX).
 * Falls back to programmatic 24x24 pixel-art.
 */

import { PALETTE, transparentPixel as _ } from './pixel-palette'
import { Texture } from 'pixi.js'
import {
  getExternalObjectTexture,
  getExternalObjectTileTexture,
  hasExternalObject,
} from './external-tiles'

const O = PALETTE.outline
const G0 = PALETTE.gold[0]
const G1 = PALETTE.gold[1]
const G2 = PALETTE.gold[2]
const G3 = PALETTE.gold[3]
const W0 = PALETTE.wood[0]
const W1 = PALETTE.wood[1]
const W2 = PALETTE.wood[2]
const W3 = PALETTE.wood[3]
const BL = PALETTE.blue
const WH = PALETTE.white
const RD = PALETTE.red

const SIZE = 24

// ─── Treasure Chest (24x24) ─────────────────────────────────────────
// Wooden chest with gold trim, slightly open with gold glow
// prettier-ignore
const TREASURE_CHEST: number[][] = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 0
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 1
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 2
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 3
  [_, _, _, _, _, _, O, O, O, O, O, O, O, O, O, O, O, O, _, _, _, _, _, _], // 4
  [_, _, _, _, _, O, W2,W1,W0,W0,W0,W0,W0,W0,W0,W0,W1,W2, O, _, _, _, _, _], // 5
  [_, _, _, _, O, W2,W1,W0,W0,G0,G0,G0,G0,G0,W0,W0,W1,W2,W3, O, _, _, _, _], // 6
  [_, _, _, _, O, W2,W1,W0,G1,G0,G0,G0,G0,G0,G1,W0,W1,W2,W3, O, _, _, _, _], // 7
  [_, _, _, O, G2,G1,G0,G0,G0,G0,G0,G0,G0,G0,G0,G0,G1,G2,G2,G3, O, _, _, _], // 8
  [_, _, _, O, W3,W2,W2,W1,W1,W1,W1,W1,W1,W1,W1,W1,W2,W2,W3,W3, O, _, _, _], // 9
  [_, _, _, O, W2,W1,W0,W0,W0,W0,W0,W0,W0,W0,W0,W0,W0,W1,W2,W3, O, _, _, _], // 10
  [_, _, _, O, W2,W1,W0,W0,W0,W0,G0,G1,G0,W0,W0,W0,W0,W1,W2,W3, O, _, _, _], // 11
  [_, _, _, O, W2,W1,W0,W0,W0,G1,G0,G0,G0,G1,W0,W0,W0,W1,W2,W3, O, _, _, _], // 12
  [_, _, _, O, W2,W1,W0,W0,W0,G1,G0,G0,G0,G1,W0,W0,W0,W1,W2,W3, O, _, _, _], // 13
  [_, _, _, O, W2,W1,W0,W0,W0,W0,G1,G2,G1,W0,W0,W0,W0,W1,W2,W3, O, _, _, _], // 14
  [_, _, _, O, W2,W1,W1,W0,W0,W0,W0,W0,W0,W0,W0,W0,W1,W1,W2,W3, O, _, _, _], // 15
  [_, _, _, O, W3,W2,W1,W1,W0,W0,W0,W0,W0,W0,W0,W1,W1,W2,W3,W3, O, _, _, _], // 16
  [_, _, _, O, W3,W2,W2,W1,W1,W1,W1,W1,W1,W1,W1,W1,W2,W2,W3,W3, O, _, _, _], // 17
  [_, _, _, _, O, W3,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W3,W3, O, _, _, _, _], // 18
  [_, _, _, _, _, O, O, O, O, O, O, O, O, O, O, O, O, O, O, _, _, _, _, _], // 19
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 20
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 21
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 22
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 23
]

// ─── Small House / Mercadinho (24x24) ───────────────────────────────
// Cute casinha que cê entra — red roof, wood walls, door, window
// prettier-ignore
const MARKET_HOUSE: number[][] = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 0
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 1
  [_, _, _, _, _, _, _, _, O, O, O, O, O, O, O, O, _, _, _, _, _, _, _, _], // 2
  [_, _, _, _, _, _, _, O, RD,RD,RD,RD,RD,RD,RD,RD, O, _, _, _, _, _, _, _], // 3
  [_, _, _, _, _, _, O, RD,RD,RD,RD,RD,RD,RD,RD,RD,RD, O, _, _, _, _, _, _], // 4
  [_, _, _, _, _, O, RD,RD,RD,RD,RD,RD,RD,RD,RD,RD,RD,RD,RD, O, _, _, _, _, _], // 5
  [_, _, _, _, O, RD,RD,RD,RD,RD,RD,RD,RD,RD,RD,RD,RD,RD,RD,RD, O, _, _, _, _], // 6
  [_, _, _, O, RD,RD,RD,RD,RD,RD,RD,RD,RD,RD,RD,RD,RD,RD,RD,RD,RD, O, _, _, _], // 7
  [_, _, _, O, W3, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W3, O, _, _, _], // 8
  [_, _, _, O, W2, W1, W0, W0, W0, BL,BL, W0, W0, W0, W0, W0, W0, W1, W2, O, _, _, _], // 9
  [_, _, _, O, W2, W1, W0, W0, W0, BL,BL, W0, W0, W0, W0, W0, W0, W1, W2, O, _, _, _], // 10
  [_, _, _, O, W2, W1, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W1, W2, O, _, _, _], // 11
  [_, _, _, O, W2, W1, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W1, W2, O, _, _, _], // 12
  [_, _, _, O, W2, W1, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W1, W2, O, _, _, _], // 13
  [_, _, _, O, W2, W1, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W1, W2, O, _, _, _], // 14
  [_, _, _, O, W2, W1, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W1, W2, O, _, _, _], // 15
  [_, _, _, O, W2, W1, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W0, W1, W2, O, _, _, _], // 16
  [_, _, _, O, W3, W2, W1, W1, W2, W3, W3, W2, W1, W1, W1, W1, W1, W2, W3, O, _, _, _], // 17 door
  [_, _, _, _, O, W3, W2, W2, W2, W2, W3, W3, W2, W2, W2, W2, W2, W3, O, _, _, _, _, _], // 18
  [_, _, _, _, _, O, O, O, O, O, O, O, O, O, O, O, O, O, O, _, _, _, _, _, _], // 19
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 20
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 21
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 22
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 23
]

// ─── Backpack (24x24) ──────────────────────────────────────────────
// Brown leather backpack with buckle and straps
// prettier-ignore
const BACKPACK: number[][] = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 0
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 1
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 2
  [_, _, _, _, _, _, _, _, _, O, O, O, O, O, O, _, _, _, _, _, _, _, _, _], // 3
  [_, _, _, _, _, _, _, _, O, W1,W0,W0,W0,W0,W1, O, _, _, _, _, _, _, _, _], // 4
  [_, _, _, _, _, _, _, _, O, W1,W1,W0,W0,W1,W1, O, _, _, _, _, _, _, _, _], // 5
  [_, _, _, _, _, _, _, _, _, O, O, O, O, O, O, _, _, _, _, _, _, _, _, _], // 6
  [_, _, _, _, _, _, _, O, O, O, W1,W0,W0,W1, O, O, O, _, _, _, _, _, _, _], // 7
  [_, _, _, _, _, _, O, W1,W0,W0,W0,W0,W0,W0,W0,W0,W1, O, _, _, _, _, _, _], // 8
  [_, _, _, _, _, _, O, W1,W0,W0,W0,W0,W0,W0,W0,W0,W1, O, _, _, _, _, _, _], // 9
  [_, _, _, _, _, _, O, W2,W1,W0,W0,W0,W0,W0,W0,W1,W2, O, _, _, _, _, _, _], // 10
  [_, _, _, _, _, _, O, W2,W1,W0,G2,G1,G1,G2,W0,W1,W2, O, _, _, _, _, _, _], // 11
  [_, _, _, _, _, _, O, W2,W1,W0,G1,G0,G0,G1,W0,W1,W2, O, _, _, _, _, _, _], // 12
  [_, _, _, _, _, _, O, W2,W1,W0,G2,G1,G1,G2,W0,W1,W2, O, _, _, _, _, _, _], // 13
  [_, _, _, _, _, _, O, W2,W1,W1,W0,W0,W0,W0,W1,W1,W2, O, _, _, _, _, _, _], // 14
  [_, _, _, _, _, _, O, W3,W2,W1,W1,W1,W1,W1,W1,W2,W3, O, _, _, _, _, _, _], // 15
  [_, _, _, _, _, _, O, W3,W2,W1,W1,W1,W1,W1,W1,W2,W3, O, _, _, _, _, _, _], // 16
  [_, _, _, _, _, _, O, W3,W2,W2,W1,W1,W1,W1,W2,W2,W3, O, _, _, _, _, _, _], // 17
  [_, _, _, _, _, _, O, W3,W3,W2,W2,W2,W2,W2,W2,W3,W3, O, _, _, _, _, _, _], // 18
  [_, _, _, _, _, _, _, O, W3,W3,W2,W2,W2,W2,W3,W3, O, _, _, _, _, _, _, _], // 19
  [_, _, _, _, _, _, _, _, O, O, O, O, O, O, O, O, _, _, _, _, _, _, _, _], // 20
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 21
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 22
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 23
]

// ─── Mailbox (24x24) ───────────────────────────────────────────────
// Blue mailbox on wooden post, red flag, letter peeking out
// prettier-ignore
const MAILBOX: number[][] = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 0
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 1
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 2
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, RD, _, _, _, _, _, _], // 3
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, RD,RD, _, _, _, _, _, _], // 4
  [_, _, _, _, _, _, _, _, _, O, O, O, O, O, O, O,RD, O, _, _, _, _, _, _], // 5
  [_, _, _, _, _, _, _, _, O, BL,BL,BL,BL,BL,BL,BL,BL,BL, O, _, _, _, _, _], // 6
  [_, _, _, _, _, _, _, O, BL,BL,BL,BL,BL,BL,BL,BL,BL,BL,BL, O, _, _, _, _], // 7
  [_, _, _, _, _, _, _, O, BL,BL, O, O, O, O, O,BL,BL,BL,BL, O, _, _, _, _], // 8
  [_, _, _, _, _, _, _, O, BL,BL, O, WH,WH,WH, O,BL,BL,BL,BL, O, _, _, _, _], // 9
  [_, _, _, _, _, _, _, O, BL,BL, O, WH,WH,WH, O,BL,BL,BL,BL, O, _, _, _, _], // 10
  [_, _, _, _, _, _, _, O, BL,BL, O, O, O, O, O,BL,BL,BL,BL, O, _, _, _, _], // 11
  [_, _, _, _, _, _, _, O, BL,BL,BL,BL,BL,BL,BL,BL,BL,BL,BL, O, _, _, _, _], // 12
  [_, _, _, _, _, _, _, _, O, BL,BL,BL,BL,BL,BL,BL,BL,BL, O, _, _, _, _, _], // 13
  [_, _, _, _, _, _, _, _, _, O, O, O, O, O, O, O, O, O, _, _, _, _, _, _], // 14
  [_, _, _, _, _, _, _, _, _, _, _, _, O, W2, O, _, _, _, _, _, _, _, _, _], // 15
  [_, _, _, _, _, _, _, _, _, _, _, _, O, W2, O, _, _, _, _, _, _, _, _, _], // 16
  [_, _, _, _, _, _, _, _, _, _, _, _, O, W2, O, _, _, _, _, _, _, _, _, _], // 17
  [_, _, _, _, _, _, _, _, _, _, _, _, O, W2, O, _, _, _, _, _, _, _, _, _], // 18
  [_, _, _, _, _, _, _, _, _, _, _, _, O, W3, O, _, _, _, _, _, _, _, _, _], // 19
  [_, _, _, _, _, _, _, _, _, _, O, O, O, W3, O, O, O, _, _, _, _, _, _, _], // 20
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 21
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 22
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 23
]

// ─── Canvas rendering ───────────────────────────────────────────────

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

/** Map of object zone IDs to their pixel data. */
const OBJECT_PIXELS: Record<string, number[][]> = {
  treasure: TREASURE_CHEST,
  market: MARKET_HOUSE,
  backpack: BACKPACK,
  mailbox: MAILBOX,
}

/**
 * Generate a pixel-art canvas for the given object zone ID.
 * Returns null if no pixel data exists for that ID.
 */
export function generateObjectCanvas(zoneId: string): HTMLCanvasElement | null {
  const pixels = OBJECT_PIXELS[zoneId]
  if (!pixels) return null
  return renderPixelData(pixels, SIZE, SIZE)
}

/** Zone IDs that use external PNG from /rpg/objects/{id}.png (e.g. Kenney Tiny Town). */
const EXTERNAL_PNG_ZONES = ['market']

/**
 * Generate a PixiJS Texture for a zone ID.
 * Order: 1) external PNG (/rpg/objects/), 2) 0x72 tiles, 3) programmatic pixel-art.
 */
export function generateObjectTexture(zoneId: string): Texture | null {
  if (EXTERNAL_PNG_ZONES.includes(zoneId)) {
    const tex = getExternalObjectTexture(zoneId)
    if (tex) return tex
  }
  if (hasExternalObject(zoneId)) {
    const tile = getExternalObjectTileTexture(zoneId)
    if (tile) return tile
  }

  const canvas = generateObjectCanvas(zoneId)
  if (!canvas) return null
  return Texture.from(canvas)
}

export { SIZE as OBJECT_SPRITE_SIZE }
