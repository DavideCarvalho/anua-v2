/**
 * Unified colour palette for pixel art sprites.
 *
 * Limited palette (8-12 colours per sprite) with hue-shifted shadows
 * (shifted toward blue/purple) and warm highlights. Every sprite in the
 * game should pull colours exclusively from this file.
 *
 * Ramps go from highlight -> mid -> shadow -> dark.
 */
export const PALETTE = {
  // Character skin (4 colours: highlight, mid, shadow, dark)
  skin: [0xffe5c9, 0xddb896, 0xa67c52, 0x6b4423] as const,

  // Character clothing - teal/green school uniform (4 colours)
  clothing: [0x5bc0a0, 0x3a9b7a, 0x267a5e, 0x1a5a42] as const,

  // Hair - dark brown (3 colours)
  hair: [0x5c3a21, 0x3e2515, 0x2a1a0f] as const,

  // Outline (coloured, not pure black - Stardew Valley style)
  outline: 0x1a1a2e,

  // Objects
  gold: [0xffd700, 0xdaa520, 0xb8860b, 0x8b6914] as const,
  wood: [0xdeb887, 0xa67b5b, 0x8b5e3c, 0x5c3a21] as const,
  stone: [0xc0c0c0, 0x808080, 0x505050, 0x303030] as const,

  // Environment
  grass: [0x7ec850, 0x5ba33a, 0x3d7a28, 0x2a5a1c] as const,
  water: [0x5b9bd5, 0x4a80b8, 0x3a6a9a, 0x2a4a6e] as const,

  // UI accents
  red: 0xe05050,
  blue: 0x5090e0,
  white: 0xfff8f0,

  // Transparent sentinel (use 0 in pixel data arrays)
  transparent: 0,
} as const

/** Shorthand alias used in pixel data arrays. 0 = transparent. */
export const transparentPixel = 0
