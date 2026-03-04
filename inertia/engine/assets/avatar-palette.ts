/**
 * Avatar palette for pixel-art player sprite.
 *
 * Maps avatar customization (skinTone, hairColor, outfit) to color ramps
 * used when rendering the sprite. Each channel needs multiple shades for
 * pixel-art shading (highlight, mid, shadow, dark).
 */

import type { AvatarData } from '../types'

/** Parse hex to RGB. */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff }
}

/** RGB to hex. */
function rgbToHex(r: number, g: number, b: number): number {
  return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)
}

/** Lighten a color by a factor (0=black, 1=unchanged, >1=lighter). */
function lighten(hex: string, factor: number): number {
  const { r, g, b } = hexToRgb(hex)
  const t = 255
  return rgbToHex(
    r + (t - r) * (1 - factor),
    g + (t - g) * (1 - factor),
    b + (t - b) * (1 - factor)
  )
}

/** Darken a color by a factor (0=black, 1=unchanged). */
function darken(hex: string, factor: number): number {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(r * factor, g * factor, b * factor)
}

/** Create a 4-shade ramp from a base hex. */
function makeRamp4(baseHex: string): [number, number, number, number] {
  return [
    lighten(baseHex, 0.85), // highlight
    Number.parseInt(baseHex.replace('#', ''), 16), // mid
    darken(baseHex, 0.75), // shadow
    darken(baseHex, 0.5), // dark
  ]
}

/** Create a 3-shade ramp from a base hex. */
function makeRamp3(baseHex: string): [number, number, number] {
  return [
    lighten(baseHex, 0.9), // highlight
    Number.parseInt(baseHex.replace('#', ''), 16), // mid
    darken(baseHex, 0.6), // dark
  ]
}

const SKIN_HEX: Record<string, string> = {
  light: '#f5d0c5',
  medium: '#d4a574',
  dark: '#8d5524',
  default: '#d4a574',
}

const HAIR_HEX: Record<string, string> = {
  black: '#1a1a1a',
  brown: '#5c4033',
  blonde: '#f5deb3',
  red: '#a52a2a',
  default: '#5c4033',
}

const OUTFIT_HEX: Record<string, string> = {
  default: '#4a90d9',
  blue: '#4a90d9',
  green: '#48bb78',
  red: '#e53e3e',
  purple: '#805ad5',
  orange: '#ed8936',
  yellow: '#ecc94b',
  teal: '#5bc0a0',
}

function getSkinHex(skinTone?: string): string {
  const key = (skinTone ?? 'medium').toLowerCase()
  return SKIN_HEX[key] ?? SKIN_HEX.medium
}

function getHairHex(hairColor?: string): string {
  const key = (hairColor ?? 'brown').toLowerCase()
  return HAIR_HEX[key] ?? HAIR_HEX.brown
}

function getOutfitHex(outfit?: string): string {
  const key = (outfit ?? 'default').toLowerCase()
  return OUTFIT_HEX[key] ?? OUTFIT_HEX.default
}

/** Semantic indices used in pixel-player: 1-4 skin, 5-7 hair, 8-11 clothing, 12 outline, 13 white. */
export const PALETTE_INDICES = {
  skin: [1, 2, 3, 4] as const,
  hair: [5, 6, 7] as const,
  clothing: [8, 9, 10, 11] as const,
  outline: 12,
  white: 13,
} as const

/** Map from semantic index to hex color. Used when blitting avatar-customized sprite. */
export type AvatarPaletteMap = Record<number, number>

/**
 * Get the palette mapping for the given avatar.
 * Returns a Record<number, number> where keys are semantic indices (1-13)
 * and values are 0xRRGGBB colors.
 */
export function getAvatarPalette(avatar?: AvatarData | null): AvatarPaletteMap {
  const skin = makeRamp4(getSkinHex(avatar?.skinTone))
  const hair = makeRamp3(getHairHex(avatar?.hairColor))
  const clothing = makeRamp4(getOutfitHex(avatar?.outfit))

  return {
    1: skin[0],
    2: skin[1],
    3: skin[2],
    4: skin[3],
    5: hair[0],
    6: hair[1],
    7: hair[2],
    8: clothing[0],
    9: clothing[1],
    10: clothing[2],
    11: clothing[3],
    12: 0x1a1a2e, // outline
    13: 0xfff8f0, // white
  }
}
