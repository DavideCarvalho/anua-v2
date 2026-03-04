import type { TileMapData } from '../maps/map-types'
import type { Position } from '../player/input-manager'

/** Half-size of the player's collision hitbox (16x16 centered on player). */
const HITBOX_HALF = 8

/**
 * Tile-based collision checker for indoor scenes.
 *
 * Checks the four corners of the player's hitbox against the walls layer.
 * A tile is impassable if `walls[tileY * width + tileX] !== 0`.
 */
export class TilemapCollision {
  private readonly walls: number[]
  private readonly mapWidth: number
  private readonly mapHeight: number
  private readonly tileSize: number

  constructor(mapData: TileMapData) {
    this.walls = mapData.layers.walls
    this.mapWidth = mapData.width
    this.mapHeight = mapData.height
    this.tileSize = mapData.tileSize
  }

  /**
   * Check if a position is passable (all 4 corners of the hitbox are
   * on walkable tiles).
   */
  isPassable(pos: Position): boolean {
    // Check all 4 corners of the player hitbox
    const corners: Position[] = [
      { x: pos.x - HITBOX_HALF, y: pos.y - HITBOX_HALF }, // top-left
      { x: pos.x + HITBOX_HALF, y: pos.y - HITBOX_HALF }, // top-right
      { x: pos.x - HITBOX_HALF, y: pos.y + HITBOX_HALF }, // bottom-left
      { x: pos.x + HITBOX_HALF, y: pos.y + HITBOX_HALF }, // bottom-right
    ]

    for (const corner of corners) {
      const tileX = Math.floor(corner.x / this.tileSize)
      const tileY = Math.floor(corner.y / this.tileSize)

      // Out of bounds = impassable
      if (tileX < 0 || tileX >= this.mapWidth || tileY < 0 || tileY >= this.mapHeight) {
        return false
      }

      if (this.walls[tileY * this.mapWidth + tileX] !== 0) {
        return false
      }
    }

    return true
  }

  /**
   * Resolve collision with wall-slide behaviour.
   *
   * If the desired position is blocked:
   * 1. Try X-only slide
   * 2. Try Y-only slide
   * 3. Stay at current position
   */
  resolve(current: Position, desired: Position): Position {
    if (this.isPassable(desired)) {
      return desired
    }

    // Try X-only slide
    const slideX: Position = { x: desired.x, y: current.y }
    if (this.isPassable(slideX)) {
      return slideX
    }

    // Try Y-only slide
    const slideY: Position = { x: current.x, y: desired.y }
    if (this.isPassable(slideY)) {
      return slideY
    }

    return current
  }
}
