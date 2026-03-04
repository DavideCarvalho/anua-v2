export interface MovementVector {
  dx: number
  dy: number
}

export interface Position {
  x: number
  y: number
}

const MOVEMENT_KEYS = new Set([
  'w',
  'a',
  's',
  'd',
  'arrowup',
  'arrowdown',
  'arrowleft',
  'arrowright',
])

const INTERACTION_KEYS = new Set(['enter', ' '])

/**
 * Abstracts keyboard (WASD/arrows) and tap-to-walk input for the player.
 *
 * Rules:
 * - Keyboard has priority over tap-to-walk
 * - Keyboard press cancels any active tap target
 * - Input is ignored when focus is on input/textarea/select
 * - Enter/Space triggers interaction (consumed by Phase 3)
 */
export class InputManager {
  private readonly keys = new Set<string>()
  private tapTarget: Position | null = null
  private interactionPressed = false
  private destroyed = false

  // Bound handlers for cleanup
  private readonly onKeyDown: (e: KeyboardEvent) => void
  private readonly onKeyUp: (e: KeyboardEvent) => void

  constructor() {
    this.onKeyDown = this.handleKeyDown.bind(this)
    this.onKeyUp = this.handleKeyUp.bind(this)

    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Ignore when focus is on form elements
    const tag = (document.activeElement?.tagName || '').toLowerCase()
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return

    const key = e.key.toLowerCase()

    if (MOVEMENT_KEYS.has(key)) {
      this.keys.add(key)
      this.tapTarget = null // keyboard cancels tap-to-walk
      e.preventDefault()
    }

    if (INTERACTION_KEYS.has(key)) {
      this.interactionPressed = true
      e.preventDefault()
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keys.delete(e.key.toLowerCase())
  }

  /**
   * Set a tap-to-walk target in scene coordinates.
   * Only accepted if the point passes the validation callback (e.g. inside island).
   */
  setTapTarget(pos: Position): void {
    this.tapTarget = pos
  }

  /** Clear the tap target (e.g. when player arrives). */
  clearTapTarget(): void {
    this.tapTarget = null
  }

  /** Get the current tap target, if any. */
  getTapTarget(): Position | null {
    return this.tapTarget
  }

  /** Whether any keyboard movement keys are pressed. */
  hasKeyboardInput(): boolean {
    return this.keys.size > 0
  }

  /**
   * Returns the desired movement vector based on current input.
   * Keyboard input takes priority over tap-to-walk.
   *
   * @param playerPos - Current player position (needed for tap-to-walk direction)
   * @param arrivalThreshold - Distance at which tap target is considered reached
   * @returns Movement vector (not normalized, not scaled by speed)
   */
  getMovementVector(playerPos: Position, arrivalThreshold = 4): MovementVector {
    let dx = 0
    let dy = 0

    if (this.keys.size > 0) {
      // Keyboard movement
      if (this.keys.has('a') || this.keys.has('arrowleft')) dx -= 1
      if (this.keys.has('d') || this.keys.has('arrowright')) dx += 1
      if (this.keys.has('w') || this.keys.has('arrowup')) dy -= 1
      if (this.keys.has('s') || this.keys.has('arrowdown')) dy += 1
    } else if (this.tapTarget) {
      // Tap-to-walk
      const toX = this.tapTarget.x - playerPos.x
      const toY = this.tapTarget.y - playerPos.y
      const dist = Math.sqrt(toX * toX + toY * toY)

      if (dist < arrivalThreshold) {
        this.tapTarget = null
      } else {
        dx = toX / dist
        dy = toY / dist
      }
    }

    // Normalize diagonal keyboard input
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len > 1) {
      dx /= len
      dy /= len
    }

    return { dx, dy }
  }

  /**
   * Check and consume the interaction flag (Enter/Space).
   * Returns true once per press.
   */
  hasInteraction(): boolean {
    if (this.interactionPressed) {
      this.interactionPressed = false
      return true
    }
    return false
  }

  /** Clean up all event listeners. */
  destroy(): void {
    if (this.destroyed) return
    this.destroyed = true
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    this.keys.clear()
    this.tapTarget = null
  }
}
