/**
 * External player sprites.
 * Uses Cute Fantasy premade NPC sheet for the overworld avatar.
 */

import { Assets, Texture, Rectangle } from 'pixi.js'

type Direction = 'down' | 'up' | 'left' | 'right'

const SHEET_URL = '/rpg/cute-fantasy/Farmer_Bob.png'

const FRAME_W = 32
const FRAME_H = 32
const CELL = 16
const STRIDE = 4
const START_X_CELL = 1
const START_Y_CELL_BY_DIRECTION: Record<Direction, number> = {
  down: 1,
  right: 5,
  up: 9,
  left: 5,
}

export function getCuteFantasyFrameRect(
  direction: Direction,
  frameIndex: number
): { x: number; y: number; w: number; h: number } {
  const clamped = Math.max(0, Math.min(3, frameIndex))
  const xCell = START_X_CELL + clamped * STRIDE
  const yCell = START_Y_CELL_BY_DIRECTION[direction]
  return {
    x: xCell * CELL,
    y: yCell * CELL,
    w: FRAME_W,
    h: FRAME_H,
  }
}

let cachedTextures: Record<Direction, Texture[]> | null = null

function frameTex(source: Texture, x: number, y: number, w: number, h: number): Texture {
  return new Texture({
    source: source.source,
    frame: new Rectangle(x, y, w, h),
  })
}

/**
 * Preload the spritesheet. Call before creating the player.
 */
export async function preload0x72Player(): Promise<void> {
  if (cachedTextures) return
  const source = (await Assets.load(SHEET_URL)) as Texture

  const makeFrames = (direction: Direction): Texture[] => {
    const frames: Texture[] = []
    for (let i = 0; i < 4; i++) {
      const { x, y, w, h } = getCuteFantasyFrameRect(direction, i)
      frames.push(frameTex(source, x, y, w, h))
    }
    return frames
  }

  cachedTextures = {
    down: makeFrames('down'),
    up: makeFrames('up'),
    left: makeFrames('left'),
    right: makeFrames('right'),
  }
}

/**
 * Build player textures. Must call preload0x72Player() first.
 */
export function get0x72PlayerTextures(): Record<Direction, Texture[]> {
  if (!cachedTextures) {
    throw new Error('Call preload0x72Player() before get0x72PlayerTextures()')
  }
  return cachedTextures
}

export function has0x72Player(): boolean {
  return true
}
