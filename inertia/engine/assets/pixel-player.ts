/**
 * Programmatically generated pixel-art player spritesheet.
 * Retro 2D style — compact, readable, classic RPG look.
 *
 * Produces a 128x128 spritesheet (4 cols x 4 rows of 32x32 frames):
 *   Row 0: Down | Row 1: Left | Row 2: Right | Row 3: Up
 *
 * Uses semantic indices (1-13) for skin, hair, clothing — resolved via
 * getAvatarPalette(avatar) for customization from the points shop.
 *
 * Walk cycle: stand, right step, stand, left step (subtle bob).
 */

import { transparentPixel as _ } from './pixel-palette'
import { getAvatarPalette } from './avatar-palette'
import type { AvatarData } from '../types'

// ─── Semantic indices (resolved by getAvatarPalette) ──────────────────
// 1-4: skin, 5-7: hair, 8-11: clothing, 12: outline, 13: white
const O = 12
const S0 = 1
const S1 = 2
const S2 = 3
const S3 = 4
const C0 = 8
const C1 = 9
const C2 = 10
const C3 = 11
const H0 = 5
const H1 = 6
const H2 = 7
const W = 13

// ─── Standing frames (32x32, 0 = transparent) ────────────────────────

/** Down-facing (facing camera) — cap, face, uniform. */
// prettier-ignore
const DOWN_STAND: number[][] = [
  [_, _, _, _, _, _, _, _, _, _, _, O, O, O, O, O, O, O, O, O, O, _, _, _, _, _, _, _, _, _, _, _], // 0
  [_, _, _, _, _, _, _, _, _, _, O, C0,C0,C0,C0,C0,C0,C0,C0,C0,C0,C0, O, _, _, _, _, _, _, _, _, _], // 1 cap
  [_, _, _, _, _, _, _, _, _, O, C0,C1,C1,C1,C1,C1,C1,C1,C1,C1,C1,C0, O, _, _, _, _, _, _, _, _, _], // 2
  [_, _, _, _, _, _, _, _, O, H0,H0,H0,H0,H0,H0,H0,H0,H0,H0,H0,H0,H0, O, _, _, _, _, _, _, _, _, _], // 3 hair
  [_, _, _, _, _, _, _, _, O, H1,H1,H0,H0,H0,H0,H0,H0,H0,H0,H0,H1,H1,H1, O, _, _, _, _, _, _, _, _, _], // 4
  [_, _, _, _, _, _, _, _, O, S0,S0,S1,S1,S0,S0,S0,S0,S0,S0,S1,S1,S0,S0, O, _, _, _, _, _, _, _, _, _], // 5 face
  [_, _, _, _, _, _, _, _, O, S0,S0,S1,S1,S0,S0,S0,S0,S0,S0,S1,S1,S0,S0, O, _, _, _, _, _, _, _, _, _], // 6
  [_, _, _, _, _, _, _, _, O, S1, W, W, O, S1,S0,S0,S0,S0,S1, O, W, W,S1, O, _, _, _, _, _, _, _, _, _], // 7 eyes
  [_, _, _, _, _, _, _, _, O, S1, W, O, O, S1,S0,S0,S0,S0,S1, O, O, W,S1, O, _, _, _, _, _, _, _, _, _], // 8
  [_, _, _, _, _, _, _, _, O, S1,S1,S1,S1,S1,S0,S0,S0,S1,S1,S1,S1,S1,S1, O, _, _, _, _, _, _, _, _, _], // 9
  [_, _, _, _, _, _, _, _, O, S2,S1,S1,S1,S1,S1,S2,S2,S1,S1,S1,S1,S1,S2, O, _, _, _, _, _, _, _, _, _], // 10
  [_, _, _, _, _, _, _, _, _, O, S2,S1,S1,S1,S1,S1,S1,S1,S1,S1,S1,S2, O, _, _, _, _, _, _, _, _, _, _], // 11
  [_, _, _, _, _, _, _, _, O, S1,S1,S1,S1,S1,S0,S0,S0,S1,S1,S1,S1,S1,S1, O, _, _, _, _, _, _, _, _], // 12
  [_, _, _, _, _, _, _, _, O, S2,S1,S1,S1,S1,S1,S2,S2,S1,S1,S1,S1,S1,S2, O, _, _, _, _, _, _, _, _], // 13
  [_, _, _, _, _, _, _, _, _, O, S2,S1,S1,S1,S1,S1,S1,S1,S1,S1,S1,S2, O, _, _, _, _, _, _, _, _, _], // 14
  [_, _, _, _, _, _, _, _, _, _, O, O, S2,S2,S2,S2,S2,S2,S2, O, O, _, _, _, _, _, _, _, _, _, _, _], // 15
  [_, _, _, _, _, _, _, _, _, _, _, O, O, S2,S1,S1,S1,S2, O, O, _, _, _, _, _, _, _, _, _, _, _, _], // 16
  [_, _, _, _, _, _, _, _, _, _, _, _, O, C0,C0,C0,C0,C0, O, _, _, _, _, _, _, _, _, _, _, _, _, _], // 17
  [_, _, _, _, _, _, _, _, _, _, _, O, C0,C0,C1,C1,C1,C0,C0, O, _, _, _, _, _, _, _, _, _, _, _, _], // 18
  [_, _, _, _, _, _, _, _, _, _, O, S1,C0,C1,C1,C1,C1,C1,C0,S1, O, _, _, _, _, _, _, _, _, _, _, _], // 19
  [_, _, _, _, _, _, _, _, _, _, O, S1,C1,C1,C2,C2,C2,C1,C1,S1, O, _, _, _, _, _, _, _, _, _, _, _], // 20
  [_, _, _, _, _, _, _, _, _, _, O, S2,C1,C2,C2,C2,C2,C2,C1,S2, O, _, _, _, _, _, _, _, _, _, _, _], // 21
  [_, _, _, _, _, _, _, _, _, _, _, O, C2,C2,C3,C3,C3,C2,C2, O, _, _, _, _, _, _, _, _, _, _, _, _], // 22
  [_, _, _, _, _, _, _, _, _, _, _, O, C2,C3,C3,C3,C3,C3,C2, O, _, _, _, _, _, _, _, _, _, _, _, _], // 23
  [_, _, _, _, _, _, _, _, _, _, _, O, C3,C3,C3,C3,C3,C3,C3, O, _, _, _, _, _, _, _, _, _, _, _, _], // 24
  [_, _, _, _, _, _, _, _, _, _, _, O, C3, O, O, O, O, O,C3, O, _, _, _, _, _, _, _, _, _, _, _, _], // 25
  [_, _, _, _, _, _, _, _, _, _, _, O, O, _, _, _, _, _, O, O, _, _, _, _, _, _, _, _, _, _, _, _], // 26
  [_, _, _, _, _, _, _, _, _, _, _, O,C3,C3, _, _, _, C3,C3, O, _, _, _, _, _, _, _, _, _, _, _, _], // 27 legs 2px
  [_, _, _, _, _, _, _, _, _, _, _, O,C3,C3, _, _, _, C3,C3, O, _, _, _, _, _, _, _, _, _, _, _, _], // 28
  [_, _, _, _, _, _, _, _, _, _, O, O, O, _, _, _, _, _, O, O, O, _, _, _, _, _, _, _, _, _, _, _], // 29
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 30
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 31
]

/** Up-facing (facing away) — cap back, hair. */
// prettier-ignore
const UP_STAND: number[][] = [
  [_, _, _, _, _, _, _, _, _, _, _, O, O, O, O, O, O, O, O, O, O, _, _, _, _, _, _, _, _, _, _, _], // 0
  [_, _, _, _, _, _, _, _, _, _, O, C0,C0,C0,C0,C0,C0,C0,C0,C0,C0,C0, O, _, _, _, _, _, _, _, _, _], // 1 cap
  [_, _, _, _, _, _, _, _, _, O, C1,C1,C1,C1,C1,C1,C1,C1,C1,C1,C1,C0, O, _, _, _, _, _, _, _, _, _], // 2
  [_, _, _, _, _, _, _, _, O, H1,H1,H1,H1,H1,H1,H1,H1,H1,H1,H1,H1,H1, O, _, _, _, _, _, _, _, _, _], // 3
  [_, _, _, _, _, _, _, _, O, H2,H1,H1,H0,H0,H0,H0,H0,H0,H1,H1,H1,H2, O, _, _, _, _, _, _, _, _, _], // 4
  [_, _, _, _, _, _, _, _, O, H2,H1,H1,H0,H0,H0,H0,H0,H0,H0,H1,H1,H2,H2, O, _, _, _, _, _, _, _, _], // 5
  [_, _, _, _, _, _, _, _, O, H2,H2,H1,H1,H0,H0,H0,H0,H0,H1,H1,H1,H2,H2, O, _, _, _, _, _, _, _, _], // 6
  [_, _, _, _, _, _, _, _, O, H2,H2,H1,H1,H1,H0,H0,H0,H1,H1,H1,H1,H2,H2, O, _, _, _, _, _, _, _, _], // 7
  [_, _, _, _, _, _, _, _, O, H2,H2,H1,H1,H1,H1,H1,H1,H1,H1,H1,H1,H2,H2, O, _, _, _, _, _, _, _, _], // 8
  [_, _, _, _, _, _, _, _, O, H2,H2,H1,H1,H1,H1,H1,H1,H1,H1,H1,H1,H2,H2, O, _, _, _, _, _, _, _, _], // 9
  [_, _, _, _, _, _, _, _, O, H2,H2,H1,H1,H1,H1,H1,H1,H1,H1,H1,H1,H2,H2, O, _, _, _, _, _, _, _, _], // 10
  [_, _, _, _, _, _, _, _, O, H2,H2,H1,H1,H1,H1,H1,H1,H1,H1,H1,H1,H2,H2, O, _, _, _, _, _, _, _, _], // 11
  [_, _, _, _, _, _, _, _, O, H2,H2,H1,H1,H1,H1,H1,H1,H1,H1,H1,H1,H2,H2, O, _, _, _, _, _, _, _, _], // 12
  [_, _, _, _, _, _, _, _, O, H2,H2,H2,H1,H1,H1,H1,H1,H1,H1,H1,H2,H2,H2, O, _, _, _, _, _, _, _, _], // 13
  [_, _, _, _, _, _, _, _, _, O, H2,H2,H2,H1,H1,H1,H1,H1,H1,H2,H2,H2, O, _, _, _, _, _, _, _, _, _], // 14
  [_, _, _, _, _, _, _, _, _, _, O, O, H2,H2,H2,H2,H2,H2,H2, O, O, _, _, _, _, _, _, _, _, _, _, _], // 15
  [_, _, _, _, _, _, _, _, _, _, _, O, O, S2,S2,S2,S2,S2, O, O, _, _, _, _, _, _, _, _, _, _, _, _], // 16
  [_, _, _, _, _, _, _, _, _, _, _, _, O, C0,C0,C0,C0,C0, O, _, _, _, _, _, _, _, _, _, _, _, _, _], // 17
  [_, _, _, _, _, _, _, _, _, _, _, O, C0,C1,C1,C1,C1,C1,C0, O, _, _, _, _, _, _, _, _, _, _, _, _], // 18
  [_, _, _, _, _, _, _, _, _, _, O, S2,C1,C1,C2,C2,C2,C1,C1,S2, O, _, _, _, _, _, _, _, _, _, _, _], // 19
  [_, _, _, _, _, _, _, _, _, _, O, S2,C1,C2,C2,C2,C2,C2,C1,S2, O, _, _, _, _, _, _, _, _, _, _, _], // 20
  [_, _, _, _, _, _, _, _, _, _, O, S3,C2,C2,C3,C3,C3,C2,C2,S3, O, _, _, _, _, _, _, _, _, _, _, _], // 21
  [_, _, _, _, _, _, _, _, _, _, _, O, C2,C3,C3,C3,C3,C3,C2, O, _, _, _, _, _, _, _, _, _, _, _, _], // 22
  [_, _, _, _, _, _, _, _, _, _, _, O, C3,C3,C3,C3,C3,C3,C3, O, _, _, _, _, _, _, _, _, _, _, _, _], // 23
  [_, _, _, _, _, _, _, _, _, _, _, O, C3,C3,C3,C3,C3,C3,C3, O, _, _, _, _, _, _, _, _, _, _, _, _], // 24
  [_, _, _, _, _, _, _, _, _, _, _, O, C3, O, O, O, O, O,C3, O, _, _, _, _, _, _, _, _, _, _, _, _], // 25
  [_, _, _, _, _, _, _, _, _, _, _, O, O, _, _, _, _, _, O, O, _, _, _, _, _, _, _, _, _, _, _, _], // 26
  [_, _, _, _, _, _, _, _, _, _, _, O,C3,C3, _, _, _, C3,C3, O, _, _, _, _, _, _, _, _, _, _, _, _], // 27 legs 2px
  [_, _, _, _, _, _, _, _, _, _, _, O,C3,C3, _, _, _, C3,C3, O, _, _, _, _, _, _, _, _, _, _, _, _], // 28
  [_, _, _, _, _, _, _, _, _, _, O, O, O, _, _, _, _, _, O, O, O, _, _, _, _, _, _, _, _, _, _, _], // 29
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 30
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 31
]

/** Left-facing (profile) — cap, face, uniform. */
// prettier-ignore
const LEFT_STAND: number[][] = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 0
  [_, _, _, _, _, _, _, _, _, _, _, _, O, O, O, O, O, O, O, O, O, O, _, _, _, _, _, _, _, _, _, _, _], // 1
  [_, _, _, _, _, _, _, _, _, _, _, O, C0,C0,C0,C0,C0,C0,C0,C0,C0,C0, O, _, _, _, _, _, _, _, _, _, _], // 2 cap
  [_, _, _, _, _, _, _, _, _, _, O, C1,C1,H0,H0,H0,H0,H0,H0,H0,H0,C0,C0, O, _, _, _, _, _, _, _, _, _, _], // 3
  [_, _, _, _, _, _, _, _, _, O, C1,C1,H1,H0,H0,H0,H0,H0,H0,H0,H1,H1,C0, O, _, _, _, _, _, _, _, _, _, _], // 4
  [_, _, _, _, _, _, _, _, O, H2,H1,H0,H0,H0,H0,H0,H0,H0,H0,H0,H1,H1,H2, O, _, _, _, _, _, _, _, _], // 5
  [_, _, _, _, _, _, _, _, O, H2,H1,H1,H0,H0,H0,H0,H0,H0,H0,H1,H1,H1,H2, O, _, _, _, _, _, _, _, _], // 6
  [_, _, _, _, _, _, _, _, O, H2,H2,H1,H1,H0,H0,H0,H0,H0,H1,H1,H1,H2,H2, O, _, _, _, _, _, _, _, _], // 7
  [_, _, _, _, _, _, _, O, O, S1,S1,S0,S0,S0,S0,S0,S0,S1,S1,S1,S1,S1,S2, O, _, _, _, _, _, _, _, _], // 8
  [_, _, _, _, _, _, _, O, S1,S0,S0,S0,S0,S0,S0,S0,S1,S1,S1,S1,S1,S1,S2, O, _, _, _, _, _, _, _, _], // 9
  [_, _, _, _, _, _, _, O, S1, W, W, O,S0,S0,S0,S0,S1,S1,S1,S1,S1,S1,S2, O, _, _, _, _, _, _, _, _], // 10
  [_, _, _, _, _, _, _, O, S1, W, O, O,S0,S0,S0,S0,S1,S1,S1,S1,S1,S1,S2, O, _, _, _, _, _, _, _, _], // 11
  [_, _, _, _, _, _, _, O, S1,S1,S1,S1,S0,S0,S0,S1,S1,S1,S1,S1,S1,S2,S2, O, _, _, _, _, _, _, _, _], // 12
  [_, _, _, _, _, _, _, _, O, S2,S1,S1,S1,S1, O,S1,S1,S1,S1,S1,S2,S2, O, _, _, _, _, _, _, _, _, _], // 13
  [_, _, _, _, _, _, _, _, _, O, S2,S1,S1,S1,S1,S1,S1,S1,S1,S2,S2, O, _, _, _, _, _, _, _, _, _, _], // 14
  [_, _, _, _, _, _, _, _, _, _, O, O, S2,S2,S2,S2,S2,S2, O, O, _, _, _, _, _, _, _, _, _, _, _, _], // 15
  [_, _, _, _, _, _, _, _, _, _, _, O, O, S2,S1,S1,S2, O, O, _, _, _, _, _, _, _, _, _, _, _, _, _], // 16
  [_, _, _, _, _, _, _, _, _, _, _, _, O, C0,C0,C0,C0, O, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 17
  [_, _, _, _, _, _, _, _, _, _, _, O, C0,C1,C1,C1,C0,C0, O, _, _, _, _, _, _, _, _, _, _, _, _, _], // 18
  [_, _, _, _, _, _, _, _, _, _, O, S1,C1,C1,C2,C2,C1,C0,S1, O, _, _, _, _, _, _, _, _, _, _, _, _], // 19
  [_, _, _, _, _, _, _, _, _, _, O, S2,C1,C2,C2,C2,C2,C1,S2, O, _, _, _, _, _, _, _, _, _, _, _, _], // 20
  [_, _, _, _, _, _, _, _, _, _, _, O, C2,C2,C3,C3,C2,C2, O, _, _, _, _, _, _, _, _, _, _, _, _, _], // 21
  [_, _, _, _, _, _, _, _, _, _, _, O, C2,C3,C3,C3,C3,C2, O, _, _, _, _, _, _, _, _, _, _, _, _, _], // 22
  [_, _, _, _, _, _, _, _, _, _, _, O, C3,C3,C3,C3,C3,C3, O, _, _, _, _, _, _, _, _, _, _, _, _, _], // 23
  [_, _, _, _, _, _, _, _, _, _, _, O, C3,C3,C3,C3,C3,C3, O, _, _, _, _, _, _, _, _, _, _, _, _, _], // 24
  [_, _, _, _, _, _, _, _, _, _, _, O, O, O, O, O, O,C3, O, _, _, _, _, _, _, _, _, _, _, _, _, _], // 25
  [_, _, _, _, _, _, _, _, _, _, _, _, O, _, _, _, O, O, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 26
  [_, _, _, _, _, _, _, _, _, _, _, _, O,C3,C3, _, C3,C3, O, _, _, _, _, _, _, _, _, _, _, _, _, _], // 27 legs 2px
  [_, _, _, _, _, _, _, _, _, _, _, _, O,C3,C3, _, C3,C3, O, _, _, _, _, _, _, _, _, _, _, _, _, _], // 28
  [_, _, _, _, _, _, _, _, _, _, _, O, O, O, _, _, O, O, O, _, _, _, _, _, _, _, _, _, _, _, _, _], // 29
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 30
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 31
]

// ─── Frame derivation helpers ───────────────────────────────────────

/**
 * Deep-clone a 2D pixel array.
 */
function clonePixels(src: number[][]): number[][] {
  return src.map((row) => [...row])
}

/**
 * Mirror a frame horizontally (for right = mirrored left).
 */
function mirrorH(src: number[][]): number[][] {
  return src.map((row) => [...row].reverse())
}

/**
 * Apply a 1px vertical bob up (character rises slightly).
 */
function bobUp(src: number[][]): number[][] {
  const h = src.length
  const w = src[0].length
  const out: number[][] = Array.from({ length: h }, () => new Array(w).fill(_))
  for (let y = 1; y < h; y++) {
    out[y - 1] = [...src[y]]
  }
  return out
}

/**
 * Apply a 1px vertical bob down (character lowers).
 */
function bobDown(src: number[][]): number[][] {
  const h = src.length
  const w = src[0].length
  const out: number[][] = Array.from({ length: h }, () => new Array(w).fill(_))
  for (let y = 0; y < h - 1; y++) {
    out[y + 1] = [...src[y]]
  }
  return out
}

/**
 * Walk frames: subtle bob up/down for retro bounce.
 */
function makeWalkBobUp(base: number[][]): number[][] {
  return bobUp(base)
}
function makeWalkBobDown(base: number[][]): number[][] {
  return bobDown(base)
}

// ─── Build all 16 frames ────────────────────────────────────────────

/** Right-facing is a horizontal mirror of left-facing. */
const RIGHT_STAND = mirrorH(LEFT_STAND)

/** All 16 frames indexed [direction][frame]. */
function buildAllFrames(): number[][][] {
  const downFrames = [
    DOWN_STAND,
    makeWalkBobUp(DOWN_STAND),
    clonePixels(DOWN_STAND),
    makeWalkBobDown(DOWN_STAND),
  ]
  const upFrames = [
    UP_STAND,
    makeWalkBobUp(UP_STAND),
    clonePixels(UP_STAND),
    makeWalkBobDown(UP_STAND),
  ]
  const leftFrames = [
    LEFT_STAND,
    makeWalkBobUp(LEFT_STAND),
    clonePixels(LEFT_STAND),
    makeWalkBobDown(LEFT_STAND),
  ]
  const rightFrames = [
    RIGHT_STAND,
    makeWalkBobUp(RIGHT_STAND),
    clonePixels(RIGHT_STAND),
    makeWalkBobDown(RIGHT_STAND),
  ]

  // Row order: down, left, right, up
  return [...downFrames, ...leftFrames, ...rightFrames, ...upFrames]
}

// ─── Canvas rendering ───────────────────────────────────────────────

const FRAME_SIZE = 32
const SHEET_COLS = 4
const SHEET_ROWS = 4
const SHEET_WIDTH = FRAME_SIZE * SHEET_COLS // 128
const SHEET_HEIGHT = FRAME_SIZE * SHEET_ROWS // 128

/**
 * Render a 2D pixel array onto a canvas ImageData at the given offset.
 * Pixel values 1-13 are semantic indices resolved via palette; 0 = transparent.
 */
function blitFrame(
  imageData: ImageData,
  sheetWidth: number,
  pixelData: number[][],
  offsetX: number,
  offsetY: number,
  palette: Record<number, number>
): void {
  for (let y = 0; y < FRAME_SIZE; y++) {
    for (let x = 0; x < FRAME_SIZE; x++) {
      const idx = pixelData[y]?.[x] ?? 0
      if (idx === 0) continue
      const color = palette[idx] ?? idx
      const px = offsetX + x
      const py = offsetY + y
      const i = (py * sheetWidth + px) * 4
      imageData.data[i] = (color >> 16) & 0xff
      imageData.data[i + 1] = (color >> 8) & 0xff
      imageData.data[i + 2] = color & 0xff
      imageData.data[i + 3] = 255
    }
  }
}

/**
 * Generate the full 128x128 spritesheet canvas.
 *
 * When avatar is provided, uses custom palette (skin, hair, outfit) from
 * the student's avatar data. Otherwise uses default PALETTE.
 *
 * Layout:
 *   Row 0 (y=0):   Down  frames 0-3
 *   Row 1 (y=32):  Left  frames 0-3
 *   Row 2 (y=64):  Right frames 0-3
 *   Row 3 (y=96):  Up    frames 0-3
 */
export function generatePlayerSpritesheetCanvas(avatar?: AvatarData): HTMLCanvasElement {
  const palette = getAvatarPalette(avatar)
  const canvas = document.createElement('canvas')
  canvas.width = SHEET_WIDTH
  canvas.height = SHEET_HEIGHT
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.createImageData(SHEET_WIDTH, SHEET_HEIGHT)

  const allFrames = buildAllFrames()

  for (const [i, allFrame] of allFrames.entries()) {
    const col = i % SHEET_COLS
    const row = Math.floor(i / SHEET_COLS)
    blitFrame(imageData, SHEET_WIDTH, allFrame, col * FRAME_SIZE, row * FRAME_SIZE, palette)
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

/** Direction name -> row index in the spritesheet. */
export const DIRECTION_ROW: Record<string, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
}

export { FRAME_SIZE, SHEET_COLS, SHEET_ROWS }
