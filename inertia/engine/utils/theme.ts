/** Theme detection utility for the PixiJS engine. */

export type Theme = 'light' | 'dark'
export type ThemeChangeCallback = (theme: Theme) => void

/**
 * Detects the current Tailwind dark/light theme and watches for changes
 * via a MutationObserver on the `<html>` element's `class` attribute.
 */
class ThemeManager {
  private theme: Theme
  private callbacks = new Set<ThemeChangeCallback>()
  private observer: MutationObserver

  constructor() {
    this.theme = this.detectTheme()

    this.observer = new MutationObserver(() => {
      const newTheme = this.detectTheme()
      if (newTheme !== this.theme) {
        this.theme = newTheme
        this.callbacks.forEach((cb) => cb(newTheme))
      }
    })

    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
  }

  private detectTheme(): Theme {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  }

  /** Current theme value. */
  getTheme(): Theme {
    return this.theme
  }

  /** Whether the current theme is dark. */
  isDark(): boolean {
    return this.theme === 'dark'
  }

  /**
   * Register a callback fired when the theme changes.
   * Returns an unsubscribe function.
   */
  onChange(cb: ThemeChangeCallback): () => void {
    this.callbacks.add(cb)
    return () => {
      this.callbacks.delete(cb)
    }
  }

  /** Disconnect observer and clear callbacks. */
  destroy(): void {
    this.observer.disconnect()
    this.callbacks.clear()
  }
}

/** Singleton theme manager instance. Created lazily on first access. */
let instance: ThemeManager | null = null

export function getThemeManager(): ThemeManager {
  if (!instance) {
    instance = new ThemeManager()
  }
  return instance
}

export function destroyThemeManager(): void {
  instance?.destroy()
  instance = null
}

// ─── Color helpers ───

/**
 * Darken a hex colour by a factor (0..1 where 0 = black, 1 = unchanged).
 * Operates per-channel.
 */
export function darkenColor(color: number, factor: number): number {
  const r = Math.round(((color >> 16) & 0xff) * factor)
  const g = Math.round(((color >> 8) & 0xff) * factor)
  const b = Math.round((color & 0xff) * factor)
  return (r << 16) | (g << 8) | b
}

/**
 * Tint a colour toward another colour by a ratio (0 = original, 1 = target).
 */
export function tintColor(color: number, target: number, ratio: number): number {
  const r1 = (color >> 16) & 0xff
  const g1 = (color >> 8) & 0xff
  const b1 = color & 0xff
  const r2 = (target >> 16) & 0xff
  const g2 = (target >> 8) & 0xff
  const b2 = target & 0xff
  const r = Math.round(r1 + (r2 - r1) * ratio)
  const g = Math.round(g1 + (g2 - g1) * ratio)
  const b = Math.round(b1 + (b2 - b1) * ratio)
  return (r << 16) | (g << 8) | b
}

// ─── Predefined dark-mode colour mappings ───

export const OVERWORLD_COLORS = {
  light: {
    water: 0x4a90d9,
    ground: 0x6abf69,
    border: 0x4a9e49,
  },
  dark: {
    water: 0x1a3a5c,
    ground: 0x2d5a2c,
    border: 0x1e4a1d,
  },
} as const

export const INDOOR_COLORS = {
  light: {
    floor: 0xe8d5b7,
    wall: 0x5c3a21,
    door: 0xc17d4f,
    counter: 0x8b5e3c,
    shelf: 0xa67b5b,
    decoration: 0xd4a574,
  },
  dark: {
    floor: 0x8b7a5a,
    wall: 0x3a2515,
    door: 0x7a4f32,
    counter: 0x5a3d27,
    shelf: 0x6b4f3a,
    decoration: 0x8a6a47,
  },
} as const

/**
 * Get the themed tile colour palette for indoor scenes.
 * Returns a Record<number, number> matching the TILE_COLORS format.
 */
export function getThemedTileColors(theme: Theme): Record<number, number> {
  const c = theme === 'dark' ? INDOOR_COLORS.dark : INDOOR_COLORS.light
  return {
    0: 0x000000,
    1: c.floor,
    2: c.wall,
    3: c.door,
    4: c.counter,
    5: c.shelf,
    6: c.decoration,
  }
}

/**
 * Get the themed tile colour palette for overworld (Gather-style).
 * Tile 1 = grass, Tile 2 = water.
 */
export function getOverworldTileColors(theme: Theme): Record<number, number> {
  const c = theme === 'dark' ? OVERWORLD_COLORS.dark : OVERWORLD_COLORS.light
  return {
    0: 0x000000,
    1: c.ground,
    2: c.water,
  }
}
