import { Container, Graphics, Sprite } from 'pixi.js'
import type { TileMapData } from '../maps/map-types'
import { getThemedTileColors, getOverworldTileColors, type Theme } from '../utils/theme'
import {
  getTileTexture,
  getOverworldTileTexture,
  hasPixelTile,
  hasOverworldPixelTile,
} from '../assets/pixel-tiles'
import { buildBitmask, bitmaskTo16Index } from '../assets/cute-fantasy-tilemap'

export type TilemapSceneType = 'indoor' | 'overworld'

/**
 * Renders a tilemap using pixel-art tile textures when available,
 * falling back to coloured Graphics rectangles.
 *
 * Creates three layers (ground, walls, objects) each inside a Container.
 *
 * Supports theme-aware colours that can be re-rendered on demand.
 * Use sceneType 'overworld' for Gather-style grass/water tiles.
 */
export class TilemapRenderer {
  readonly container: Container
  private readonly mapData: TileMapData
  private currentTheme: Theme
  private readonly sceneType: TilemapSceneType
  /** Whether pixel-art tiles are available for this scene type. */
  private usePixelTiles: boolean

  constructor(
    mapData: TileMapData,
    theme: Theme = 'light',
    sceneType: TilemapSceneType = 'indoor'
  ) {
    this.mapData = mapData
    this.currentTheme = theme
    this.sceneType = sceneType
    this.container = new Container()

    this.usePixelTiles =
      (sceneType === 'indoor' && hasPixelTile(1)) ||
      (sceneType === 'overworld' && hasOverworldPixelTile(1))

    this.render()
  }

  private getPalette(): Record<number, number> {
    return this.sceneType === 'overworld'
      ? getOverworldTileColors(this.currentTheme)
      : getThemedTileColors(this.currentTheme)
  }

  private render(): void {
    if (this.usePixelTiles) {
      this.renderPixelTiles()
    } else {
      this.renderFallback()
    }
  }

  /**
   * Render using pixel-art tile textures (Sprites).
   */
  private renderPixelTiles(): void {
    const { width, height, tileSize, layers } = this.mapData
    // Overworld: only ground (grass/water); walls layer would double-draw water
    const layerDefs =
      this.sceneType === 'overworld'
        ? [{ data: layers.ground, name: 'ground' }]
        : ([
            { data: layers.ground, name: 'ground' },
            { data: layers.walls, name: 'walls' },
            { data: layers.objects, name: 'objects' },
          ] as const)

    for (const layerDef of layerDefs) {
      const layerContainer = new Container()

      const getTile = (tx: number, ty: number): number => {
        if (tx < 0 || tx >= width || ty < 0 || ty >= height) return 0
        return layerDef.data[ty * width + tx] ?? 0
      }
      // Grass: bit=1 when neighbor is water. Water: bit=1 when neighbor is grass.
      const isBorderFor = (tileId: number) =>
        tileId === 1 ? (id: number) => id === 2 : (id: number) => id === 1

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const tileId = layerDef.data[y * width + x]
          if (tileId === 0) continue

          let texture: ReturnType<typeof getOverworldTileTexture>
          if (this.sceneType === 'overworld') {
            const bitmask = buildBitmask(getTile, x, y, isBorderFor(tileId))
            const autotileIndex = bitmaskTo16Index(bitmask)
            texture = getOverworldTileTexture(tileId, x, y, autotileIndex)
          } else {
            texture = getTileTexture(tileId)
          }
          if (texture) {
            const sprite = new Sprite(texture)
            sprite.x = x * tileSize
            sprite.y = y * tileSize
            sprite.width = tileSize
            sprite.height = tileSize
            layerContainer.addChild(sprite)
          } else {
            // Fallback for unknown tile IDs or overworld (grass/water)
            const palette = this.getPalette()
            const color = palette[tileId] ?? palette[1]
            const g = new Graphics()
            g.rect(x * tileSize, y * tileSize, tileSize, tileSize)
            g.fill({ color })
            layerContainer.addChild(g)
          }
        }
      }

      this.container.addChild(layerContainer)
    }
  }

  /**
   * Render using coloured Graphics rectangles (original fallback).
   */
  private renderFallback(): void {
    const { width, height, tileSize, layers } = this.mapData
    const palette = this.getPalette()

    // Ground layer
    const ground = new Graphics()
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tileId = layers.ground[y * width + x]
        if (tileId === 0) continue
        const color = palette[tileId] ?? palette[1]
        ground.rect(x * tileSize, y * tileSize, tileSize, tileSize)
        ground.fill({ color })
      }
    }
    this.container.addChild(ground)

    // Walls layer (indoor only; overworld ground already has grass/water)
    if (this.sceneType !== 'overworld') {
      const walls = new Graphics()
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const tileId = layers.walls[y * width + x]
          if (tileId === 0) continue
          const color = palette[tileId] ?? palette[2]
          walls.rect(x * tileSize, y * tileSize, tileSize, tileSize)
          walls.fill({ color })
        }
      }
      this.container.addChild(walls)
    }

    // Objects layer (decorative)
    const objects = new Graphics()
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tileId = layers.objects[y * width + x]
        if (tileId === 0) continue
        const color = palette[tileId] ?? palette[6]
        // Objects are drawn slightly inset for visual distinction
        const inset = 2
        objects.rect(
          x * tileSize + inset,
          y * tileSize + inset,
          tileSize - inset * 2,
          tileSize - inset * 2
        )
        objects.fill({ color })
        objects.stroke({ color: 0x333333, width: 1 })
      }
    }
    this.container.addChild(objects)
  }

  /**
   * Re-render the tilemap with a new theme.
   * Destroys existing children and redraws them.
   */
  applyTheme(theme: Theme): void {
    if (theme === this.currentTheme) return
    this.currentTheme = theme

    // Remove all children and re-render
    this.container.removeChildren()
    this.render()
  }

  /** Get the pixel width of the entire tilemap. */
  get pixelWidth(): number {
    return this.mapData.width * this.mapData.tileSize
  }

  /** Get the pixel height of the entire tilemap. */
  get pixelHeight(): number {
    return this.mapData.height * this.mapData.tileSize
  }

  destroy(): void {
    this.container.destroy({ children: true })
  }
}
