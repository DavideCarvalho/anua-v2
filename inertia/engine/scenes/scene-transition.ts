import { Graphics, type Application } from 'pixi.js'

const FADE_DURATION = 0.3 // seconds for each fade direction
const HOLD_DURATION = 0.1 // seconds to hold at full black

/**
 * Fade-to-black transition overlay.
 *
 * Renders a full-screen black rectangle that fades in (alpha 0->1),
 * holds briefly, then fades out (alpha 1->0).
 */
export class SceneTransition {
  private overlay: Graphics
  private app: Application

  constructor(app: Application, width: number, height: number) {
    this.app = app
    this.overlay = new Graphics()
    this.overlay.rect(0, 0, width, height)
    this.overlay.fill({ color: 0x000000 })
    this.overlay.alpha = 0
    this.overlay.zIndex = 9999
  }

  /**
   * Run a fade-to-black transition.
   *
   * 1. Add overlay to stage
   * 2. Fade alpha from 0 to 1
   * 3. Execute the provided callback (scene swap)
   * 4. Fade alpha from 1 to 0
   * 5. Remove overlay from stage
   */
  async play(onMidpoint: () => Promise<void>): Promise<void> {
    this.app.stage.addChild(this.overlay)

    // Fade in (0 -> 1)
    await this.animate(0, 1, FADE_DURATION)

    // Hold at full black
    await this.wait(HOLD_DURATION)

    // Execute the scene swap at midpoint
    await onMidpoint()

    // Fade out (1 -> 0)
    await this.animate(1, 0, FADE_DURATION)

    // Clean up
    this.app.stage.removeChild(this.overlay)
  }

  private animate(from: number, to: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now()
      this.overlay.alpha = from

      const tick = () => {
        const elapsed = (performance.now() - startTime) / 1000
        const progress = Math.min(elapsed / duration, 1)

        // Ease in-out for smoother feel
        const eased =
          progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

        this.overlay.alpha = from + (to - from) * eased

        if (progress < 1) {
          requestAnimationFrame(tick)
        } else {
          this.overlay.alpha = to
          resolve()
        }
      }

      requestAnimationFrame(tick)
    })
  }

  private wait(duration: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, duration * 1000))
  }

  destroy(): void {
    this.overlay.destroy()
  }
}
