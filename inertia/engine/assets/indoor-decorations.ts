import { Container, Graphics } from 'pixi.js'
import type { Theme } from '../utils/theme'
import { darkenColor } from '../utils/theme'

/**
 * Seeded random for deterministic indoor decoration placement.
 */
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ─── Treasure Room Decorations ───

function drawTreasureDecorations(
  tileSize: number,
  width: number,
  height: number,
  isDark: boolean
): Container {
  const container = new Container()
  const g = new Graphics()
  const rng = seededRandom(100)

  // Gold sparkle dots scattered on the floor
  const sparkleColor = isDark ? 0x8b7a2f : 0xffd700
  const sparkleCount = 12
  for (let i = 0; i < sparkleCount; i++) {
    const x = (2 + rng() * (width - 4)) * tileSize
    const y = (3 + rng() * (height - 5)) * tileSize
    const size = 1 + rng() * 2
    g.star(x, y, 4, size, size * 0.4, rng() * Math.PI)
    g.fill({ color: sparkleColor, alpha: 0.5 + rng() * 0.4 })
  }

  // Gold accent lines along the counter area (row 1)
  const accentColor = isDark ? 0x6b5a1f : 0xdaa520
  g.moveTo(4 * tileSize, 1.5 * tileSize)
  g.lineTo(8 * tileSize, 1.5 * tileSize)
  g.stroke({ color: accentColor, width: 1.5, alpha: 0.6 })

  // Small coin shapes on floor
  for (let i = 0; i < 5; i++) {
    const x = (3 + rng() * 6) * tileSize
    const y = (4 + rng() * 4) * tileSize
    g.circle(x, y, 2.5)
    g.fill({ color: isDark ? 0x8b7a2f : 0xf5a623, alpha: 0.7 })
    g.stroke({ color: isDark ? 0x5a4a1a : 0xc4850a, width: 0.5 })
  }

  container.addChild(g)
  return container
}

// ─── Market Room Decorations ───

function drawMarketDecorations(
  tileSize: number,
  width: number,
  height: number,
  isDark: boolean
): Container {
  const container = new Container()
  const g = new Graphics()
  const rng = seededRandom(200)

  // Colored items on shelves (small rectangles)
  const itemColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6]
  // Left shelves (col 1, rows 3-6)
  for (let row = 3; row <= 6; row++) {
    for (let i = 0; i < 2; i++) {
      const color = itemColors[Math.floor(rng() * itemColors.length)]
      const x = 1 * tileSize + 4 + i * 12
      const y = row * tileSize + 8
      g.roundRect(x, y, 8, 10, 1)
      g.fill({ color: isDark ? darkenColor(color, 0.6) : color })
    }
  }
  // Right shelves (col 10, rows 3-6)
  for (let row = 3; row <= 6; row++) {
    for (let i = 0; i < 2; i++) {
      const color = itemColors[Math.floor(rng() * itemColors.length)]
      const x = 10 * tileSize + 4 + i * 12
      const y = row * tileSize + 8
      g.roundRect(x, y, 8, 10, 1)
      g.fill({ color: isDark ? darkenColor(color, 0.6) : color })
    }
  }

  // Basket shapes on the floor (oval shapes)
  const basketColor = isDark ? 0x5a3d20 : 0xa0724e
  for (let i = 0; i < 3; i++) {
    const x = (4 + i * 2) * tileSize + tileSize / 2
    const y = 6 * tileSize + tileSize / 2
    g.ellipse(x, y, 6, 4)
    g.fill({ color: basketColor })
    g.stroke({ color: isDark ? 0x3a2510 : 0x8b5e3c, width: 0.8 })
  }

  container.addChild(g)
  return container
}

// ─── Backpack Room Decorations ───

function drawBackpackDecorations(
  tileSize: number,
  width: number,
  height: number,
  isDark: boolean
): Container {
  const container = new Container()
  const g = new Graphics()
  const rng = seededRandom(300)

  // Scattered items on floor (small rectangles and circles)
  const itemColors = [0x8b5e3c, 0xc17d4f, 0xa67b5b, 0x6b8e23]
  for (let i = 0; i < 8; i++) {
    const x = (2 + rng() * (width - 4)) * tileSize
    const y = (3 + rng() * (height - 5)) * tileSize
    const color = itemColors[Math.floor(rng() * itemColors.length)]
    const themedColor = isDark ? darkenColor(color, 0.6) : color
    if (rng() > 0.5) {
      // Small rectangle (book/notebook)
      g.roundRect(x, y, 6 + rng() * 4, 4 + rng() * 3, 1)
      g.fill({ color: themedColor, alpha: 0.8 })
    } else {
      // Small circle (ball/bottle cap)
      g.circle(x, y, 2 + rng() * 2)
      g.fill({ color: themedColor, alpha: 0.8 })
    }
  }

  // Bag shape near center (a rounded trapezoid-like shape)
  const bagColor = isDark ? 0x4a3520 : 0x8b5e3c
  const bagX = 3 * tileSize
  const bagY = 3 * tileSize
  g.roundRect(bagX, bagY, 16, 18, 3)
  g.fill({ color: bagColor, alpha: 0.7 })
  g.stroke({ color: isDark ? 0x2a1a10 : 0x5c3a21, width: 1 })
  // Bag strap
  g.moveTo(bagX + 4, bagY)
  g.quadraticCurveTo(bagX + 8, bagY - 6, bagX + 12, bagY)
  g.stroke({ color: isDark ? 0x2a1a10 : 0x5c3a21, width: 1.2 })

  container.addChild(g)
  return container
}

// ─── Mailbox Room Decorations ───

function drawMailboxDecorations(
  tileSize: number,
  width: number,
  height: number,
  isDark: boolean
): Container {
  const container = new Container()
  const g = new Graphics()
  const rng = seededRandom(400)

  // Letter / envelope shapes scattered on floor
  const envelopeColor = isDark ? 0x8a8a7a : 0xf5f0e0
  for (let i = 0; i < 6; i++) {
    const x = (2 + rng() * (width - 4)) * tileSize
    const y = (3 + rng() * (height - 5)) * tileSize
    const w = 10 + rng() * 4
    const h = 7 + rng() * 2
    // Envelope rectangle
    g.rect(x, y, w, h)
    g.fill({ color: envelopeColor, alpha: 0.8 })
    g.stroke({ color: isDark ? 0x5a5a4a : 0xc0b890, width: 0.5 })
    // Envelope flap (V shape)
    g.moveTo(x, y)
    g.lineTo(x + w / 2, y + h * 0.5)
    g.lineTo(x + w, y)
    g.stroke({ color: isDark ? 0x5a5a4a : 0xc0b890, width: 0.5 })
  }

  // Stamp shapes (small colored squares)
  const stampColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12]
  for (let i = 0; i < 4; i++) {
    const x = (3 + rng() * (width - 6)) * tileSize
    const y = (4 + rng() * (height - 6)) * tileSize
    const color = stampColors[Math.floor(rng() * stampColors.length)]
    g.rect(x, y, 5, 5)
    g.fill({ color: isDark ? darkenColor(color, 0.6) : color })
    g.stroke({ color: isDark ? 0x333333 : 0x666666, width: 0.3 })
  }

  container.addChild(g)
  return container
}

// ─── Public API ───

/**
 * Draw themed decorations for an indoor scene based on its room ID.
 *
 * @param roomId - One of 'treasure', 'market', 'backpack', 'mailbox' (derived from zone id or counter id prefix)
 * @param tileSize - Tile size in pixels
 * @param width - Map width in tiles
 * @param height - Map height in tiles
 * @param theme - Current theme
 */
export function drawIndoorDecorations(
  roomId: string,
  tileSize: number,
  width: number,
  height: number,
  theme: Theme
): Container {
  const isDark = theme === 'dark'

  if (roomId.startsWith('treasure')) {
    return drawTreasureDecorations(tileSize, width, height, isDark)
  }
  if (roomId.startsWith('market')) {
    return drawMarketDecorations(tileSize, width, height, isDark)
  }
  if (roomId.startsWith('backpack')) {
    return drawBackpackDecorations(tileSize, width, height, isDark)
  }
  if (roomId.startsWith('mailbox')) {
    return drawMailboxDecorations(tileSize, width, height, isDark)
  }

  // Fallback: empty container
  return new Container()
}
