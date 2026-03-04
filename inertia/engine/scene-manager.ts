import type { Application } from 'pixi.js'
import { type BaseScene } from './scenes/base-scene'
import { SceneTransition } from './scenes/scene-transition'
import { SCENE_WIDTH, SCENE_HEIGHT } from './scenes/overworld-scene'

/**
 * Manages a stack of scenes with fade-to-black transitions.
 *
 * The overworld sits at the base of the stack (index 0).
 * Indoor scenes are pushed on top. Only the topmost scene
 * receives update() calls.
 */
export class SceneManager {
  private stack: BaseScene[] = []
  private app: Application
  private transitioning = false
  private onBeforeTransition?: () => void

  constructor(app: Application, onBeforeTransition?: () => void) {
    this.app = app
    this.onBeforeTransition = onBeforeTransition
  }

  /**
   * Push a new scene onto the stack.
   * Pauses the current top scene, plays a fade transition,
   * loads and starts the new scene.
   */
  async pushScene(scene: BaseScene): Promise<void> {
    if (this.transitioning) return
    this.transitioning = true

    const transition = new SceneTransition(this.app, SCENE_WIDTH, SCENE_HEIGHT)

    try {
      await transition.play(async () => {
        // Notify before scene swap (clears prompt state)
        this.onBeforeTransition?.()

        // Pause current top scene (but keep it in the stack)
        const current = this.top()
        if (current) {
          current.pause()
          current.container.visible = false
        }

        // Load and start the new scene
        await scene.load()
        scene.start()
        this.app.stage.addChild(scene.container)
        this.stack.push(scene)
      })
    } finally {
      transition.destroy()
      this.transitioning = false
    }
  }

  /**
   * Pop the top scene off the stack.
   * Destroys the top scene, plays a fade transition,
   * and resumes the previous scene.
   */
  async popScene(): Promise<void> {
    if (this.transitioning) return
    if (this.stack.length <= 1) return // don't pop the base scene
    this.transitioning = true

    const transition = new SceneTransition(this.app, SCENE_WIDTH, SCENE_HEIGHT)

    try {
      await transition.play(async () => {
        // Notify before scene swap (clears prompt state)
        this.onBeforeTransition?.()

        // Destroy and remove top scene
        const top = this.stack.pop()
        if (top) {
          this.app.stage.removeChild(top.container)
          top.destroy()
        }

        // Resume previous scene
        const previous = this.top()
        if (previous) {
          previous.container.visible = true
          previous.resume()
        }
      })
    } finally {
      transition.destroy()
      this.transitioning = false
    }
  }

  /**
   * Set the base scene (overworld). Does not play a transition.
   * Used during initial setup only.
   */
  async setBaseScene(scene: BaseScene): Promise<void> {
    await scene.load()
    scene.start()
    this.app.stage.addChild(scene.container)
    this.stack.push(scene)
  }

  /** Get the topmost scene. */
  top(): BaseScene | undefined {
    return this.stack[this.stack.length - 1]
  }

  /** Update the topmost scene. */
  update(dt: number): void {
    const scene = this.top()
    if (scene && !scene.paused) {
      scene.update(dt)
    }
  }

  /** Whether a transition is currently in progress. */
  get isTransitioning(): boolean {
    return this.transitioning
  }

  /** Destroy all scenes in the stack. */
  destroy(): void {
    for (const scene of this.stack) {
      this.app.stage.removeChild(scene.container)
      scene.destroy()
    }
    this.stack = []
  }
}
