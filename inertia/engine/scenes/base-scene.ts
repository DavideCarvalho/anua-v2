import { Container, type Application } from 'pixi.js'

/**
 * Abstract base class for all game scenes.
 *
 * Each scene owns a Container that is added to the stage.
 * Lifecycle: load() -> start() -> update() ... -> pause()/resume() -> destroy()
 */
export abstract class BaseScene {
  readonly container: Container
  protected app: Application
  private _paused = false

  constructor(app: Application) {
    this.app = app
    this.container = new Container()
  }

  /** Whether the scene is currently paused. */
  get paused(): boolean {
    return this._paused
  }

  /**
   * Load any assets needed by the scene.
   * Called once before start().
   */
  abstract load(): Promise<void>

  /**
   * Set up the scene (add children, initialize state).
   * Called once after load().
   */
  abstract start(): void

  /** Pause the scene (stop updates but keep visuals). */
  pause(): void {
    this._paused = true
  }

  /** Resume the scene after pausing. */
  resume(): void {
    this._paused = false
  }

  /**
   * Called every frame by the game loop.
   * @param dt - Delta time in seconds
   */
  abstract update(dt: number): void

  /** Tear down and clean up the scene. */
  destroy(): void {
    this.container.destroy({ children: true })
  }
}
