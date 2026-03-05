import { type Container, type Application } from 'pixi.js'
import { BaseScene } from './base-scene'
import { InputManager, type Position } from '../player/input-manager'
import { PlayerSprite } from '../player/player-sprite'
import { generatePlayerTextures } from '../assets/placeholder-sprites'
import { TilemapRenderer } from '../tilemap/tilemap-renderer'
import { TilemapCollision } from '../tilemap/tilemap-collision'
import { InteractionManager, type NearbyZone } from '../interaction/interaction-manager'
import type { TileMapData, DoorDef, InteractionZoneDef } from '../maps/map-types'
import type { Direction } from '../assets/placeholder-sprites'
import type { AvatarData } from '../types'
import { drawIndoorDecorations } from '../assets/indoor-decorations'
import { getThemeManager, type Theme } from '../utils/theme'

const SPEED = 100 // pixels per second (slightly slower indoors)
const MAX_DT = 0.05
const TAP_ARRIVAL_THRESHOLD = 4

/** Radius (in pixels) for the door exit detection zone. */
const DOOR_ZONE_RADIUS = 24

export type PromptType = 'enter' | 'interact' | 'exit' | null

export interface IndoorSceneCallbacks {
  /** Called when nearby zone or prompt type changes. */
  onNearbyZoneChange: (zone: NearbyZone, promptType: PromptType) => void
  /** Called when the player confirms exit at a door. */
  onExit: () => void
}

/**
 * Generic indoor scene parameterized by TileMapData.
 *
 * Renders a tilemap, places the player at the spawn door,
 * handles tile-based collision, and detects door/counter interactions.
 */
export class IndoorScene extends BaseScene {
  private readonly mapData: TileMapData
  private readonly callbacks: IndoorSceneCallbacks
  private tilemapRenderer!: TilemapRenderer
  private tilemapCollision!: TilemapCollision
  private inputManager!: InputManager
  private playerSprite!: PlayerSprite
  private position!: Position
  private interactionManager!: InteractionManager
  private doorZones: InteractionZoneDef[]
  private onVisibilityChange!: () => void
  private onCanvasClick!: (e: MouseEvent) => void
  private decorationsContainer!: Container
  private unsubscribeTheme?: () => void
  private readonly avatar?: AvatarData

  constructor(
    app: Application,
    mapData: TileMapData,
    avatar: AvatarData | undefined,
    callbacks: IndoorSceneCallbacks
  ) {
    super(app)
    this.mapData = mapData
    this.avatar = avatar
    this.callbacks = callbacks

    // Build door zones as InteractionZoneDefs for the InteractionManager
    this.doorZones = mapData.doors.map((door: DoorDef, i: number) => ({
      id: `door-${i}`,
      label: 'Sair',
      href: '', // doors don't navigate via router
      position: {
        x: (door.tileX + 0.5) * mapData.tileSize,
        y: (door.tileY + 0.5) * mapData.tileSize,
      },
      radius: DOOR_ZONE_RADIUS,
      color: 0xc17d4f,
      width: mapData.tileSize,
      height: mapData.tileSize,
    }))
  }

  async load(): Promise<void> {
    // Nothing async to load yet (placeholder graphics)
  }

  start(): void {
    const { mapData } = this
    const theme = getThemeManager().getTheme()

    // --- Tilemap ---
    this.tilemapRenderer = new TilemapRenderer(mapData, theme)
    // Center tilemap in the 400x300 logical space
    const offsetX = (400 - this.tilemapRenderer.pixelWidth) / 2
    const offsetY = (300 - this.tilemapRenderer.pixelHeight) / 2
    this.tilemapRenderer.container.x = offsetX
    this.tilemapRenderer.container.y = offsetY
    this.container.addChild(this.tilemapRenderer.container)

    // --- Decorations layer ---
    const roomId = this.getRoomId()
    this.decorationsContainer = drawIndoorDecorations(
      roomId,
      mapData.tileSize,
      mapData.width,
      mapData.height,
      theme
    )
    this.decorationsContainer.x = offsetX
    this.decorationsContainer.y = offsetY
    this.container.addChild(this.decorationsContainer)

    // --- Collision ---
    this.tilemapCollision = new TilemapCollision(mapData)

    // --- Player ---
    this.inputManager = new InputManager()
    const textures = generatePlayerTextures(this.app, this.avatar)
    this.playerSprite = new PlayerSprite(textures)

    // Spawn at door position (tile coords -> pixel coords, centered in tile)
    this.position = {
      x: (mapData.playerSpawn.x + 0.5) * mapData.tileSize,
      y: (mapData.playerSpawn.y + 0.5) * mapData.tileSize,
    }
    this.playerSprite.container.x = this.position.x + offsetX
    this.playerSprite.container.y = this.position.y + offsetY
    this.playerSprite.setDirection('up') // face into the room
    this.container.addChild(this.playerSprite.container)

    // --- Interaction manager (for counter zones) ---
    // Combine counter zones and door zones
    const allZones: InteractionZoneDef[] = [...mapData.interactionZones, ...this.doorZones]
    this.interactionManager = new InteractionManager(allZones, (zone: NearbyZone) => {
      if (zone === null) {
        this.callbacks.onNearbyZoneChange(null, null)
      } else if (zone.id.startsWith('door-')) {
        this.callbacks.onNearbyZoneChange(zone, 'exit')
      } else {
        this.callbacks.onNearbyZoneChange(zone, 'interact')
      }
    })

    // --- Visibility change handler ---
    this.onVisibilityChange = () => {
      if (document.hidden) this.pause()
      else this.resume()
    }
    document.addEventListener('visibilitychange', this.onVisibilityChange)

    // --- Tap-to-walk on canvas ---
    const canvas = this.app.canvas as HTMLCanvasElement
    const tilemapOffsetX = offsetX
    const tilemapOffsetY = offsetY
    this.onCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      // Convert screen coords to logical coords (400x300)
      const sceneX = ((e.clientX - rect.left) / rect.width) * 400
      const sceneY = ((e.clientY - rect.top) / rect.height) * 300
      // Convert to tilemap-local coords
      const localX = sceneX - tilemapOffsetX
      const localY = sceneY - tilemapOffsetY
      // Only accept taps inside the tilemap area
      if (
        localX >= 0 &&
        localX < this.tilemapRenderer.pixelWidth &&
        localY >= 0 &&
        localY < this.tilemapRenderer.pixelHeight
      ) {
        this.inputManager.setTapTarget({ x: localX, y: localY })
      }
    }
    canvas.addEventListener('click', this.onCanvasClick)

    // --- Theme change listener ---
    this.unsubscribeTheme = getThemeManager().onChange((newTheme) => {
      this.applyTheme(newTheme)
    })
  }

  update(dt: number): void {
    if (this.paused) return
    dt = Math.min(dt, MAX_DT)

    const { dx, dy } = this.inputManager.getMovementVector(this.position, TAP_ARRIVAL_THRESHOLD)
    const isMoving = dx !== 0 || dy !== 0

    if (isMoving) {
      const newX = this.position.x + dx * SPEED * dt
      const newY = this.position.y + dy * SPEED * dt

      // Resolve collision using tilemap
      const resolved = this.tilemapCollision.resolve(this.position, { x: newX, y: newY })

      this.position = resolved

      const offsetX = (400 - this.tilemapRenderer.pixelWidth) / 2
      const offsetY = (300 - this.tilemapRenderer.pixelHeight) / 2
      this.playerSprite.container.x = resolved.x + offsetX
      this.playerSprite.container.y = resolved.y + offsetY

      // Direction
      const dir: Direction =
        Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
      this.playerSprite.setDirection(dir)
      this.playerSprite.setWalking(true)
    } else {
      this.playerSprite.setWalking(false)
    }

    this.playerSprite.update(dt)

    // Update interaction zones
    this.interactionManager.update(this.position)
  }

  /**
   * Derive the room ID from the first interaction zone's ID prefix.
   */
  private getRoomId(): string {
    const firstZone = this.mapData.interactionZones[0]
    if (!firstZone) return 'unknown'
    // e.g. 'treasure-counter' -> 'treasure'
    return firstZone.id.split('-')[0]
  }

  /**
   * Re-apply theme colours without tearing down the scene.
   */
  private applyTheme(theme: Theme): void {
    // Re-render tilemap with new colours
    this.tilemapRenderer.applyTheme(theme)

    // Replace decorations
    const { mapData } = this
    const offsetX = (400 - this.tilemapRenderer.pixelWidth) / 2
    const offsetY = (300 - this.tilemapRenderer.pixelHeight) / 2

    const idx = this.container.getChildIndex(this.decorationsContainer)
    this.container.removeChild(this.decorationsContainer)
    this.decorationsContainer.destroy({ children: true })

    const roomId = this.getRoomId()
    this.decorationsContainer = drawIndoorDecorations(
      roomId,
      mapData.tileSize,
      mapData.width,
      mapData.height,
      theme
    )
    this.decorationsContainer.x = offsetX
    this.decorationsContainer.y = offsetY
    this.container.addChildAt(this.decorationsContainer, idx)
  }

  destroy(): void {
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    const canvas = this.app.canvas as HTMLCanvasElement
    canvas?.removeEventListener('click', this.onCanvasClick)

    this.unsubscribeTheme?.()
    this.inputManager?.destroy()
    this.interactionManager?.destroy()
    this.tilemapRenderer?.destroy()
    this.playerSprite?.destroy()
    super.destroy()
  }
}
