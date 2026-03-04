import { Container, Graphics } from 'pixi.js'
import { ISLAND_BOUNDARY } from '../utils/polygon'
import { isPointInPolygon } from '../utils/polygon'
import type { Theme } from '../utils/theme'
import { darkenColor } from '../utils/theme'

/**
 * Seeded pseudo-random number generator for deterministic decoration placement.
 * We want decorations in the same spot every load.
 */
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ─── Grass tufts ───

interface GrassTuft {
  x: number
  y: number
  size: number
}

function generateGrassTufts(count: number): GrassTuft[] {
  const rng = seededRandom(42)
  const tufts: GrassTuft[] = []

  // Island bounding box (approx)
  const minX = 63
  const maxX = 325
  const minY = 53
  const maxY = 232

  let attempts = 0
  while (tufts.length < count && attempts < count * 10) {
    attempts++
    const x = minX + rng() * (maxX - minX)
    const y = minY + rng() * (maxY - minY)
    if (isPointInPolygon({ x, y }, ISLAND_BOUNDARY)) {
      tufts.push({ x, y, size: 1.5 + rng() * 2 })
    }
  }
  return tufts
}

// ─── Flowers ───

interface Flower {
  x: number
  y: number
  color: number
  size: number
}

const FLOWER_COLORS = [0xff6b6b, 0xffd93d, 0x6bcbff, 0xff9ff3, 0xffffff]

function generateFlowers(count: number): Flower[] {
  const rng = seededRandom(123)
  const flowers: Flower[] = []

  const minX = 70
  const maxX = 320
  const minY = 60
  const maxY = 225

  let attempts = 0
  while (flowers.length < count && attempts < count * 10) {
    attempts++
    const x = minX + rng() * (maxX - minX)
    const y = minY + rng() * (maxY - minY)
    if (isPointInPolygon({ x, y }, ISLAND_BOUNDARY)) {
      flowers.push({
        x,
        y,
        color: FLOWER_COLORS[Math.floor(rng() * FLOWER_COLORS.length)],
        size: 1.2 + rng() * 1.5,
      })
    }
  }
  return flowers
}

// ─── Small bushes ───

interface Bush {
  x: number
  y: number
  size: number
}

function generateBushes(count: number): Bush[] {
  const rng = seededRandom(777)
  const bushes: Bush[] = []

  const minX = 68
  const maxX = 322
  const minY = 58
  const maxY = 228

  let attempts = 0
  while (bushes.length < count && attempts < count * 10) {
    attempts++
    const x = minX + rng() * (maxX - minX)
    const y = minY + rng() * (maxY - minY)
    if (isPointInPolygon({ x, y }, ISLAND_BOUNDARY)) {
      bushes.push({ x, y, size: 4 + rng() * 3 })
    }
  }
  return bushes
}

// ─── Dirt path connecting buildings ───

/** The 3 building positions (from overworld-map.ts). Mochila removed — opened via [I] key. */
const BUILDING_POSITIONS = [
  { x: 80, y: 80 }, // treasure (top-left)
  { x: 300, y: 70 }, // market (top-right)
  { x: 310, y: 195 }, // mailbox (bottom-right)
]

/** Center hub for the path network. */
const PATH_HUB = { x: 190, y: 140 }

// ─── Main draw function ───

const GRASS_TUFTS = generateGrassTufts(35)
const FLOWERS = generateFlowers(18)
const BUSHES = generateBushes(8)

/**
 * Draw all overworld decorations into a Container.
 * Call this AFTER drawing the island ground and BEFORE object sprites.
 */
export function drawOverworldDecorations(theme: Theme): Container {
  const container = new Container()
  const isDark = theme === 'dark'
  const dimFactor = isDark ? 0.6 : 1

  // --- Dirt paths (drawn first, underneath everything else) ---
  const paths = new Graphics()
  const pathColor = isDark ? 0x4a3a25 : 0xc4a76c
  const pathWidth = 6

  for (const building of BUILDING_POSITIONS) {
    paths.moveTo(PATH_HUB.x, PATH_HUB.y)
    paths.lineTo(building.x, building.y)
    paths.stroke({ color: pathColor, width: pathWidth, cap: 'round' })
  }
  container.addChild(paths)

  // --- Grass tufts ---
  const grass = new Graphics()
  for (const tuft of GRASS_TUFTS) {
    const baseColor = 0x4d8b31
    const color = isDark ? darkenColor(baseColor, 0.5) : baseColor
    // Draw 3 small lines per tuft
    for (let i = -1; i <= 1; i++) {
      grass.moveTo(tuft.x + i * tuft.size * 0.6, tuft.y)
      grass.lineTo(tuft.x + i * tuft.size * 0.3, tuft.y - tuft.size * 2)
      grass.stroke({ color, width: 0.8 })
    }
  }
  container.addChild(grass)

  // --- Flowers ---
  const flowerGraphics = new Graphics()
  for (const flower of FLOWERS) {
    const color = isDark ? darkenColor(flower.color, 0.6) : flower.color
    flowerGraphics.circle(flower.x, flower.y, flower.size)
    flowerGraphics.fill({ color })
  }
  container.addChild(flowerGraphics)

  // --- Bushes ---
  const bushGraphics = new Graphics()
  for (const bush of BUSHES) {
    const color = isDark ? darkenColor(0x2e7d32, 0.55) : 0x2e7d32
    // Draw bush as 2-3 overlapping circles
    bushGraphics.circle(bush.x - bush.size * 0.3, bush.y, bush.size * 0.7)
    bushGraphics.fill({ color })
    bushGraphics.circle(bush.x + bush.size * 0.3, bush.y, bush.size * 0.7)
    bushGraphics.fill({ color })
    bushGraphics.circle(bush.x, bush.y - bush.size * 0.3, bush.size * 0.6)
    bushGraphics.fill({ color: isDark ? darkenColor(0x388e3c, 0.55) : 0x388e3c })
  }
  container.addChild(bushGraphics)

  // Apply overall dim for dark mode
  if (isDark) {
    container.alpha = 0.85
  }

  return container
}
