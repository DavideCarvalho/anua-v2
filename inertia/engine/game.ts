import { Application, type Ticker } from 'pixi.js'
import { preload0x72Player } from './assets/external-player'
import { preloadOverworldTiles } from './assets/external-tiles'
import { SceneManager } from './scene-manager'
import { OverworldScene, SCENE_WIDTH, SCENE_HEIGHT } from './scenes/overworld-scene'
import { IndoorScene, type PromptType } from './scenes/indoor-scene'
import type { NearbyZone } from './interaction/interaction-manager'
import type { TileMapData } from './maps/map-types'
import { TREASURE_ROOM_MAP } from './maps/treasure-room-map'
import { MARKET_ROOM_MAP } from './maps/market-room-map'
import { getThemeManager, destroyThemeManager } from './utils/theme'

/** Map from overworld zone IDs to their indoor tilemap data. Mailbox opens overlay, not a room. */
const INDOOR_MAPS: Record<string, TileMapData> = {
  treasure: TREASURE_ROOM_MAP,
  market: MARKET_ROOM_MAP,
}

/** Typed scene state pushed from the engine to React. */
export interface SceneState {
  ready: boolean
  nearbyZone: NearbyZone
  promptType: PromptType
}

export type EngineAction = 'enter' | 'exit'

import type { AvatarData } from './types'

export type { AvatarData }

export interface GameEngineOptions {
  /** The HTML element the canvas will be appended to and sized against. */
  container: HTMLElement
  /** Avatar customization for the in-game player sprite. */
  avatar?: AvatarData
  /** Optional callback fired whenever the engine's high-level state changes. */
  onSceneStateChange?: (state: Partial<SceneState>) => void
}

/**
 * PixiJS game engine wrapper.
 *
 * Phase 1: Create and initialise a PixiJS Application, manage ticker, clean destroy.
 * Phase 2: Scene management, logical coordinate scaling, game loop with OverworldScene.
 * Phase 3: Object sprites, interaction zones, HUD/prompt state bridge to React.
 * Phase 4: Scene stack (SceneManager), indoor tilemap scenes with push/pop transitions.
 * Phase 5: Visual polish — decorations, animations, dark mode, loading screen.
 */
export class GameEngine {
  private app: Application | null = null
  private destroyed = false
  private sceneManager: SceneManager | null = null
  private resizeObserver: ResizeObserver | null = null
  private readonly container: HTMLElement
  private readonly avatar?: AvatarData
  private readonly onSceneStateChange?: (state: Partial<SceneState>) => void
  /** The zone the player was near when they entered a building (for prompt context). */
  private pendingEnterZone: NearbyZone = null

  constructor(opts: GameEngineOptions) {
    this.container = opts.container
    this.avatar = opts.avatar
    this.onSceneStateChange = opts.onSceneStateChange
  }

  /**
   * Initialise the PixiJS application. Must be awaited before interacting
   * with the engine.
   */
  async init(): Promise<void> {
    if (this.destroyed) return

    // Eagerly initialise the theme manager so it starts observing
    getThemeManager()

    const app = new Application()

    await app.init({
      resizeTo: this.container,
      backgroundAlpha: 0,
      antialias: false,
      resolution: window.devicePixelRatio ?? 1,
      autoDensity: true,
    })

    // Guard against destroy() being called while init was in-flight
    if (this.destroyed) {
      app.destroy(true, { children: true })
      return
    }

    this.app = app
    const canvasEl = app.canvas as HTMLCanvasElement
    // Crisp pixel-art rendering: disable browser interpolation
    canvasEl.style.imageRendering = 'pixelated'
    this.container.appendChild(canvasEl)

    // Set up logical coordinate scaling (400x300 -> actual canvas size)
    this.updateStageScale()

    // Listen for resize to update scale
    this.resizeObserver = new ResizeObserver(() => this.updateStageScale())
    this.resizeObserver.observe(this.container)

    // Create the scene manager (clears prompt state before transitions)
    this.sceneManager = new SceneManager(app, () => {
      this.onSceneStateChange?.({ nearbyZone: null, promptType: null })
    })

    await preload0x72Player()
    await preloadOverworldTiles()

    // Start the overworld scene with nearby-zone bridge
    const overworldScene = new OverworldScene(app, this.avatar, (zone: NearbyZone) => {
      this.pendingEnterZone = zone
      this.onSceneStateChange?.({
        nearbyZone: zone,
        promptType: zone ? 'enter' : null,
      })
    })
    await this.sceneManager.setBaseScene(overworldScene)

    // Set up the game loop on the ticker
    app.ticker.add((ticker) => {
      this.sceneManager?.update(ticker.deltaMS / 1000)
    })

    // Notify React that the engine is ready
    this.onSceneStateChange?.({ ready: true })
  }

  /**
   * Handle an engine action from the React layer.
   *
   * - 'enter': Push the indoor scene for the current nearby zone.
   * - 'exit': Pop back to the overworld.
   */
  async handleAction(action: EngineAction): Promise<void> {
    if (!this.app || !this.sceneManager) return

    if (action === 'enter' && this.pendingEnterZone) {
      const zoneId = this.pendingEnterZone.id
      const mapData = INDOOR_MAPS[zoneId]
      if (!mapData) return

      const indoorScene = new IndoorScene(this.app, mapData, this.avatar, {
        onNearbyZoneChange: (zone: NearbyZone, promptType: PromptType) => {
          this.onSceneStateChange?.({ nearbyZone: zone, promptType })
        },
        onExit: () => {
          this.handleAction('exit')
        },
      })

      await this.sceneManager.pushScene(indoorScene)
    } else if (action === 'exit') {
      await this.sceneManager.popScene()
    }
  }

  /**
   * Scale the stage so that logical coordinates (SCENE_WIDTH x SCENE_HEIGHT)
   * map to the actual canvas pixel size, maintaining aspect ratio.
   */
  private updateStageScale(): void {
    if (!this.app) return
    const canvas = this.app.canvas as HTMLCanvasElement
    const containerWidth = canvas.clientWidth
    const containerHeight = canvas.clientHeight

    // Uniform scale to maintain aspect ratio
    const scaleX = containerWidth / SCENE_WIDTH
    const scaleY = containerHeight / SCENE_HEIGHT
    const scale = Math.min(scaleX, scaleY)

    this.app.stage.scale.set(scale, scale)

    // Center the stage if aspect ratios differ
    const scaledW = SCENE_WIDTH * scale
    const scaledH = SCENE_HEIGHT * scale
    this.app.stage.x = (containerWidth - scaledW) / 2
    this.app.stage.y = (containerHeight - scaledH) / 2
  }

  /** Access the underlying PixiJS application (may be null before init). */
  getApp(): Application | null {
    return this.app
  }

  /** Access the ticker for adding/removing update callbacks. */
  getTicker(): Ticker | null {
    return this.app?.ticker ?? null
  }

  /**
   * Tear down all PixiJS resources.
   * Safe to call multiple times and even before `init()` resolves.
   */
  destroy(): void {
    this.destroyed = true

    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    if (this.sceneManager) {
      this.sceneManager.destroy()
      this.sceneManager = null
    }

    if (this.app) {
      this.app.destroy(true, { children: true })
      this.app = null
    }

    destroyThemeManager()

    this.onSceneStateChange?.({ ready: false, nearbyZone: null, promptType: null })
  }
}
