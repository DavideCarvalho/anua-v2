import { type InputManager, type Position } from './input-manager'
import { type PlayerSprite } from './player-sprite'
import type { Direction } from '../assets/placeholder-sprites'
import { isPointInPolygon } from '../utils/polygon'

const SPEED = 120 // pixels per second
const TAP_ARRIVAL_THRESHOLD = 4
const MAX_DT = 0.05 // cap delta time at 50ms

/**
 * Manages player movement, collision, and animation state.
 *
 * Each frame:
 * 1. Reads input from InputManager
 * 2. Calculates desired movement (speed * dt)
 * 3. Applies wall-slide collision against island boundary
 * 4. Updates PlayerSprite direction and animation
 * 5. Exposes position for other systems
 */
export class PlayerController {
  private position: Position
  private readonly input: InputManager
  private readonly sprite: PlayerSprite
  private readonly boundary: Position[]

  constructor(
    input: InputManager,
    sprite: PlayerSprite,
    boundary: Position[],
    initialPosition: Position
  ) {
    this.input = input
    this.sprite = sprite
    this.boundary = boundary
    this.position = { ...initialPosition }

    // Set initial sprite position
    this.sprite.container.x = this.position.x
    this.sprite.container.y = this.position.y
  }

  /**
   * Update player each frame.
   * @param dt - Delta time in seconds (will be capped at MAX_DT)
   */
  update(dt: number): void {
    dt = Math.min(dt, MAX_DT)

    const { dx, dy } = this.input.getMovementVector(this.position, TAP_ARRIVAL_THRESHOLD)
    const isMoving = dx !== 0 || dy !== 0

    if (isMoving) {
      const newX = this.position.x + dx * SPEED * dt
      const newY = this.position.y + dy * SPEED * dt

      // Wall-slide collision
      let finalPos = this.resolveCollision(this.position, { x: newX, y: newY }, dx, dy, dt)

      this.position = finalPos
      this.sprite.container.x = finalPos.x
      this.sprite.container.y = finalPos.y

      // Determine direction from movement vector
      this.sprite.setDirection(this.getDirection(dx, dy))
      this.sprite.setWalking(true)
    } else {
      this.sprite.setWalking(false)
    }

    // Update walk animation
    this.sprite.update(dt)
  }

  /**
   * Wall-slide collision resolution.
   * If full move is outside boundary:
   *   - Try X-only slide
   *   - Else try Y-only slide
   *   - Else stay put
   */
  private resolveCollision(
    current: Position,
    desired: Position,
    _dx: number,
    _dy: number,
    _dt: number
  ): Position {
    // Try full move first
    if (isPointInPolygon(desired, this.boundary)) {
      return desired
    }

    // Try X-only slide
    const slideX: Position = { x: desired.x, y: current.y }
    if (isPointInPolygon(slideX, this.boundary)) {
      return slideX
    }

    // Try Y-only slide
    const slideY: Position = { x: current.x, y: desired.y }
    if (isPointInPolygon(slideY, this.boundary)) {
      return slideY
    }

    // Stay put
    return current
  }

  /** Determine the 4-direction facing from the movement vector. */
  private getDirection(dx: number, dy: number): Direction {
    // Use the dominant axis
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left'
    }
    return dy > 0 ? 'down' : 'up'
  }

  /** Get current position (for other systems like camera, interaction zones). */
  getPosition(): Position {
    return { ...this.position }
  }

  destroy(): void {
    this.sprite.destroy()
  }
}
