import { Texture, Rectangle, type Application } from 'pixi.js'
import {
  generatePlayerSpritesheetCanvas,
  DIRECTION_ROW,
  FRAME_SIZE,
  SHEET_COLS,
} from './pixel-player'
import type { AvatarData } from '../types'
import { get0x72PlayerTextures, has0x72Player } from './external-player'

export type Direction = 'down' | 'up' | 'left' | 'right'

/** Cache spritesheet canvas by avatar key to avoid regenerating. */
let canvasCache: { key: string; canvas: HTMLCanvasElement } | null = null

function getAvatarCacheKey(avatar?: AvatarData): string {
  if (!avatar) return '__default__'
  return JSON.stringify({
    skinTone: avatar.skinTone,
    hairColor: avatar.hairColor,
    outfit: avatar.outfit,
  })
}

/**
 * Generates player textures for all 4 directions, each with 4 walk frames.
 * Prefers 0x72 Dungeon Tileset (lizard_m); falls back to programmatic.
 *
 * When avatar is provided and using programmatic, uses customization from
 * the points shop. Ignored when using 0x72.
 *
 * Returns a Record mapping each direction to an array of 4 Textures.
 */
export function generatePlayerTextures(
  _app: Application,
  avatar?: AvatarData
): Record<Direction, Texture[]> {
  if (has0x72Player()) {
    return get0x72PlayerTextures()
  }

  const key = getAvatarCacheKey(avatar)
  if (canvasCache?.key === key) {
    // Reuse cached canvas
  } else {
    canvasCache = { key, canvas: generatePlayerSpritesheetCanvas(avatar) }
  }
  const canvas = canvasCache.canvas
  const baseTexture = Texture.from(canvas, { scaleMode: 'nearest' })

  const directions: Direction[] = ['down', 'left', 'right', 'up']
  const result = {} as Record<Direction, Texture[]>

  for (const dir of directions) {
    const row = DIRECTION_ROW[dir]
    const frames: Texture[] = []

    for (let col = 0; col < SHEET_COLS; col++) {
      const frame = new Texture({
        source: baseTexture.source,
        frame: new Rectangle(col * FRAME_SIZE, row * FRAME_SIZE, FRAME_SIZE, FRAME_SIZE),
      })
      frames.push(frame)
    }

    result[dir] = frames
  }

  return result
}
