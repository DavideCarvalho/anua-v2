/**
 * External tile textures for overworld.
 * Cute Fantasy (Kenmi Art, premium) — grass + water + beach.
 */

import { Assets, Texture, Rectangle } from 'pixi.js'
import {
  GRASS_16_LAYOUT,
  BEACH_16_LAYOUT,
  getGrassMiddleFrameCoords,
  pickGrassMiddleVariantIndex,
  getGrassAutotileIndex,
  getBeachAutotileIndex,
  shouldUseExternalGrass,
} from './cute-fantasy-tilemap'

const CUTE_ASSET_REV = '20260303b'

const CUTE_GRASS_URLS = [
  `/rpg/cute-fantasy/Grass_Tiles_1.png?v=${CUTE_ASSET_REV}`,
  `/rpg/cute-fantasy/Grass_Tiles_2.png?v=${CUTE_ASSET_REV}`,
  `/rpg/cute-fantasy/Grass_Tiles_3.png?v=${CUTE_ASSET_REV}`,
  `/rpg/cute-fantasy/Grass_Tiles_4.png?v=${CUTE_ASSET_REV}`,
]
const CUTE_GRASS_MIDDLE_URLS = [
  `/rpg/cute-fantasy/Grass_1_Middle.png?v=${CUTE_ASSET_REV}`,
  `/rpg/cute-fantasy/Grass_2_Middle.png?v=${CUTE_ASSET_REV}`,
  `/rpg/cute-fantasy/Grass_3_Middle.png?v=${CUTE_ASSET_REV}`,
  `/rpg/cute-fantasy/Grass_4_Middle.png?v=${CUTE_ASSET_REV}`,
]
const CUTE_WATER_URL = `/rpg/cute-fantasy/Water_Middle.png?v=${CUTE_ASSET_REV}`
const CUTE_BEACH_URL = `/rpg/cute-fantasy/Beach_Tiles.png?v=${CUTE_ASSET_REV}`
const CUTE_PATH_URL = `/rpg/cute-fantasy/Path_Middle.png?v=${CUTE_ASSET_REV}`

let overworldTextureCache: {
  grassSheets: Texture[]
  grassMiddle: Texture[]
  water: Texture
  beachSheet: Texture
  path: Texture
} | null = null

function frameTex(source: Texture, x: number, y: number, w: number, h: number): Texture {
  return new Texture({
    source: source.source,
    frame: new Rectangle(x, y, w, h),
  })
}

/**
 * Preload overworld tiles. Call before creating OverworldScene.
 */
export async function preloadOverworldTiles(): Promise<void> {
  if (overworldTextureCache) return
  const [grassSheets, grassMiddle] = await Promise.all([
    Promise.all(CUTE_GRASS_URLS.map((url) => Assets.load(url) as Promise<Texture>)),
    Promise.all(CUTE_GRASS_MIDDLE_URLS.map((url) => Assets.load(url) as Promise<Texture>)),
  ])
  const waterTex = (await Assets.load(CUTE_WATER_URL)) as Texture
  const beachSheet = (await Assets.load(CUTE_BEACH_URL)) as Texture
  const pathTex = (await Assets.load(CUTE_PATH_URL)) as Texture

  // Fallback to old atlas slicing if standalone middle files are unavailable.
  if (grassMiddle.length === 0) {
    const middleCoords = getGrassMiddleFrameCoords()
    const grassMiddleSheet = grassSheets[3] ?? grassSheets[0]
    for (const [col, row] of middleCoords) {
      grassMiddle.push(frameTex(grassMiddleSheet, col * 16, row * 16, 16, 16))
    }
  }

  overworldTextureCache = {
    grassSheets,
    grassMiddle,
    water: waterTex,
    beachSheet,
    path: pathTex,
  }
}

/**
 * Get overworld texture. Uses autotileIndex for grass/water edges.
 * Grass: autotileIndex 0 → middle (variety from tileX,tileY); else edge/corner from GRASS_16_LAYOUT.
 * Water: autotileIndex 0 → Water_Middle; else Beach_Tiles from BEACH_16_LAYOUT.
 */
export function getExternalOverworldTexture(
  tileId: number,
  tileX?: number,
  tileY?: number,
  autotileIndex?: number
): Texture | null {
  if (!overworldTextureCache) return null
  const idx = autotileIndex ?? 0

  if (tileId === 1) {
    if (!shouldUseExternalGrass()) return null
    const grassIdx = getGrassAutotileIndex(idx)
    if (grassIdx === 0) {
      const arr = overworldTextureCache.grassMiddle
      if (
        tileX !== null &&
        tileX !== undefined &&
        tileY !== null &&
        tileY !== undefined &&
        arr.length > 0
      ) {
        const i = pickGrassMiddleVariantIndex(tileX, tileY, arr.length)
        return arr[i]
      }
      return arr[0]
    }
    const [col, row] = GRASS_16_LAYOUT[grassIdx] ?? [0, 0]
    return frameTex(overworldTextureCache.grassSheets[0], col * 16, row * 16, 16, 16)
  }
  if (tileId === 2) {
    const beachIdx = getBeachAutotileIndex(idx)
    if (beachIdx === 0) return overworldTextureCache.water
    const [col, row] = BEACH_16_LAYOUT[beachIdx] ?? [0, 0]
    return frameTex(overworldTextureCache.beachSheet, col * 16, row * 16, 16, 16)
  }
  if (tileId === 3) {
    return overworldTextureCache.path
  }
  return null
}

export function hasExternalOverworldTile(tileId: number): boolean {
  return (
    overworldTextureCache !== null &&
    overworldTextureCache !== undefined &&
    (tileId === 1 || tileId === 2 || tileId === 3)
  )
}

const OBJECTS_BASE = '/rpg/objects'

/** Zone ID -> 0x72 frame filename (no .png). Uses frames from 0x72-dungeon. */
const OBJECT_0X72_FRAME: Record<string, string> = {
  treasure: 'chest_full_open_anim_f1',
  // market, mailbox — use programmatic (no good match in 0x72)
}

/** Cache textures by URL. */
const textureCache: Record<string, Texture> = {}

/**
 * Get external texture for an overworld object (treasure, market, mailbox).
 * Prefers PNG in public/rpg/objects/{zoneId}.png; falls back to Kenney tile.
 */
export function getExternalObjectTexture(zoneId: string): Texture | null {
  const url = `${OBJECTS_BASE}/${zoneId}.png`
  if (textureCache[url]) return textureCache[url]

  const texture = Texture.from(url)
  textureCache[url] = texture
  return texture
}

const DUNGEON_BASE = '/rpg/0x72-dungeon/frames'

/**
 * Get 0x72 frame as object texture (chest, etc.).
 */
export function getExternalObjectTileTexture(zoneId: string): Texture | null {
  const frame = OBJECT_0X72_FRAME[zoneId]
  if (!frame) return null

  const url = `${DUNGEON_BASE}/${frame}.png`
  if (textureCache[url]) return textureCache[url]

  const texture = Texture.from(url)
  textureCache[url] = texture
  return texture
}

export function hasExternalObject(zoneId: string): boolean {
  return zoneId in OBJECT_0X72_FRAME
}
