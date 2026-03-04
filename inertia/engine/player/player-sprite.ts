import { Container, Sprite, type Texture } from 'pixi.js'
import type { Direction } from '../assets/placeholder-sprites'

/** ~150ms per frame = 0.15s */
const WALK_FRAME_INTERVAL = 0.15

/** Number of walk frames per direction. */
const FRAME_COUNT = 4

/**
 * Manages the player's visual representation.
 *
 * Uses pre-generated pixel-art textures (4 frames per direction) to show
 * directional facing and a proper walk cycle animation.
 *
 * Walk cycle:
 *   Frame 0: Standing neutral
 *   Frame 1: Right step (bob up)
 *   Frame 2: Standing neutral (pass-through)
 *   Frame 3: Left step (bob up)
 */
export class PlayerSprite {
  readonly container: Container
  private sprite: Sprite
  private textures: Record<Direction, Texture[]>
  private baseScale = 1
  private currentDirection: Direction = 'down'
  private walkFrame = 0
  private walkTimer = 0
  private isWalking = false

  constructor(textures: Record<Direction, Texture[]>) {
    this.textures = textures
    this.container = new Container()

    this.sprite = new Sprite(textures.down[0])
    this.sprite.anchor.set(0.5, 0.5)
    const w = this.sprite.texture?.width ?? 32
    this.baseScale = getPlayerBaseScale(w)
    this.sprite.scale.set(this.baseScale)
    this.container.addChild(this.sprite)
  }

  /** Set the facing direction. */
  setDirection(dir: Direction): void {
    if (dir === this.currentDirection) return
    this.currentDirection = dir
    this.updateFrame()
  }

  /** Set whether the walk animation is playing. */
  setWalking(walking: boolean): void {
    if (walking === this.isWalking) return
    this.isWalking = walking
    if (!walking) {
      this.walkFrame = 0
      this.walkTimer = 0
      this.updateFrame()
    }
  }

  /** Update walk animation timer. Call each frame with delta time in seconds. */
  update(dt: number): void {
    if (!this.isWalking) return

    this.walkTimer += dt
    if (this.walkTimer >= WALK_FRAME_INTERVAL) {
      this.walkTimer -= WALK_FRAME_INTERVAL
      this.walkFrame = (this.walkFrame + 1) % FRAME_COUNT
      this.updateFrame()
    }
  }

  /** Get the current facing direction. */
  getDirection(): Direction {
    return this.currentDirection
  }

  private updateFrame(): void {
    const frames = this.textures[this.currentDirection]
    const frameIndex = Math.min(this.walkFrame, frames.length - 1)
    this.sprite.texture = frames[frameIndex]
    // 0x72 lizard faces right; flip for left
    this.sprite.scale.x = getSpriteScaleForDirection(this.currentDirection, this.baseScale)
    this.sprite.scale.y = this.baseScale
  }

  destroy(): void {
    this.container.destroy({ children: true })
  }
}

export function getSpriteScaleForDirection(direction: Direction, baseScale: number): number {
  return direction === 'left' ? -baseScale : baseScale
}

export function getPlayerBaseScale(_textureWidth: number): number {
  return 1
}
