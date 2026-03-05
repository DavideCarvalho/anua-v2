import { Container, Graphics, Sprite, type Application } from 'pixi.js'
import { BaseScene } from './base-scene'
import { InputManager, type Position } from '../player/input-manager'
import { PlayerSprite } from '../player/player-sprite'
import { generatePlayerTextures } from '../assets/placeholder-sprites'
import { InteractionManager, type NearbyZone } from '../interaction/interaction-manager'
import { OVERWORLD_TILEMAP } from '../maps/overworld-tilemap'
import type { InteractionZoneDef } from '../maps/map-types'
import { generateObjectTexture } from '../assets/pixel-objects'
import { TilemapRenderer } from '../tilemap/tilemap-renderer'
import { TilemapCollision } from '../tilemap/tilemap-collision'
import { buildOverworldTileDebugSnapshot } from '../assets/cute-fantasy-tilemap'
import { getThemeManager, darkenColor, type Theme } from '../utils/theme'
import type { Direction } from '../assets/placeholder-sprites'
import type { AvatarData } from '../types'

type TileDebugWindow = Window & {
  __ANUA_OVERWORLD_TILE_DEBUG__?: () => unknown
  __ANUA_OVERWORLD_TILE_DEBUG_JSON__?: () => string
  __ANUA_PRINT_OVERWORLD_TILE_DEBUG__?: () => string
}

/** Viewport dimensions (visible area, Pokemon-style). */
const VIEWPORT_WIDTH = 400
const VIEWPORT_HEIGHT = 300

/** World dimensions (larger than viewport for scrolling). */
const WORLD_WIDTH = 640
const WORLD_HEIGHT = 400

/** Speed of the sine bob animation for object sprites (radians/sec). */
const BOB_SPEED = 2.5
/** Amplitude of the bob animation in logical pixels. */
const BOB_AMPLITUDE = 2

/** Faster bob speed when the object is the active nearby zone. */
const ACTIVE_BOB_SPEED = 5
/** Larger bob amplitude when active. */
const ACTIVE_BOB_AMPLITUDE = 3

/** Max number of floating particles per object. */
const MAX_PARTICLES = 3

const SPEED = 120
const TAP_ARRIVAL_THRESHOLD = 4
const MAX_DT = 0.05

interface FloatingParticle {
  graphics: Graphics
  x: number
  baseY: number
  offsetY: number
  alpha: number
  speed: number
  maxDrift: number
}

interface ObjectEntry {
  zone: InteractionZoneDef
  sprite: Sprite | Graphics
  baseY: number
  glow: Graphics
  particles: FloatingParticle[]
}

function drawObjectSprite(zone: InteractionZoneDef, theme: Theme): Graphics {
  const g = new Graphics()
  const hw = zone.width / 2
  const hh = zone.height / 2
  const color = theme === 'dark' ? darkenColor(zone.color, 0.7) : zone.color

  g.roundRect(-hw, -hh, zone.width, zone.height, 4)
  g.fill({ color })
  g.stroke({ color: 0x333333, width: 1.5 })

  return g
}

function createObjectVisual(zone: InteractionZoneDef, theme: Theme): Sprite | Graphics {
  const texture = generateObjectTexture(zone.id)
  if (texture) {
    const sprite = new Sprite(texture)
    sprite.anchor.set(0.5, 0.5)
    sprite.width = zone.width
    sprite.height = zone.height
    return sprite
  }
  return drawObjectSprite(zone, theme)
}

function createGlow(zone: InteractionZoneDef, theme: Theme): Graphics {
  const g = new Graphics()
  const hw = zone.width / 2 + 3
  const hh = zone.height / 2 + 3
  const color = theme === 'dark' ? darkenColor(zone.color, 0.7) : zone.color

  g.roundRect(-hw, -hh, hw * 2, hh * 2, 6)
  g.fill({ color, alpha: 0.15 })
  g.alpha = 0

  return g
}

function createParticle(x: number, baseY: number, theme: Theme): FloatingParticle {
  const g = new Graphics()
  const color = theme === 'dark' ? 0xaaaacc : 0xffffff
  g.circle(0, 0, 1.2)
  g.fill({ color, alpha: 0.7 })
  g.x = x + (Math.random() - 0.5) * 12
  g.y = baseY - 15
  g.alpha = 0

  return {
    graphics: g,
    x: g.x,
    baseY: baseY - 15,
    offsetY: 0,
    alpha: 0,
    speed: 8 + Math.random() * 6,
    maxDrift: 12 + Math.random() * 8,
  }
}

/**
 * The main overworld scene — Gather.town style tile-based map.
 *
 * Renders a tilemap (grass/water), places the player and interactive
 * objects, and runs tile-based collision with the interaction manager.
 */
export class OverworldScene extends BaseScene {
  private worldContainer!: Container
  private inputManager!: InputManager
  private playerSprite!: PlayerSprite
  private position!: Position
  private tilemapRenderer!: TilemapRenderer
  private tilemapCollision!: TilemapCollision
  private interactionManager!: InteractionManager
  private objectEntries: ObjectEntry[] = []
  private elapsed = 0
  private onVisibilityChange!: () => void
  private onCanvasClick!: (e: MouseEvent) => void
  private onNearbyZoneChange?: (zone: NearbyZone) => void
  private currentNearbyZoneId: string | null = null
  private unsubscribeTheme?: () => void
  private readonly avatar?: AvatarData

  constructor(
    app: Application,
    avatar?: AvatarData,
    onNearbyZoneChange?: (zone: NearbyZone) => void
  ) {
    super(app)
    this.avatar = avatar
    this.onNearbyZoneChange = onNearbyZoneChange
  }

  async load(): Promise<void> {
    // Nothing async to load
  }

  private installTileDebugHelpers(): void {
    if (typeof window === 'undefined') return

    const snapshot = buildOverworldTileDebugSnapshot({
      width: OVERWORLD_TILEMAP.width,
      height: OVERWORLD_TILEMAP.height,
      ground: OVERWORLD_TILEMAP.layers.ground,
    })

    const w = window as TileDebugWindow
    w.__ANUA_OVERWORLD_TILE_DEBUG__ = () => snapshot
    w.__ANUA_OVERWORLD_TILE_DEBUG_JSON__ = () => JSON.stringify(snapshot)
    w.__ANUA_PRINT_OVERWORLD_TILE_DEBUG__ = () => {
      const json = JSON.stringify(snapshot, null, 2)
      console.log(json)
      return json
    }
  }

  start(): void {
    const theme = getThemeManager().getTheme()

    // --- Viewport mask (show only 400x300, Pokemon-style) ---
    const mask = new Graphics()
    mask.rect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT)
    mask.fill(0xffffff)
    this.container.addChild(mask)
    this.container.mask = mask

    // --- World container (camera will pan this) ---
    this.worldContainer = new Container()
    this.container.addChild(this.worldContainer)

    // --- Tilemap (Gather-style grass/water) ---
    this.tilemapRenderer = new TilemapRenderer(OVERWORLD_TILEMAP, theme, 'overworld')
    this.worldContainer.addChild(this.tilemapRenderer.container)

    // --- Object sprites at zone positions ---
    for (const zone of OVERWORLD_TILEMAP.interactionZones) {
      const sprite = createObjectVisual(zone, theme)
      sprite.x = zone.position.x
      sprite.y = zone.position.y
      this.worldContainer.addChild(sprite)

      const glow = createGlow(zone, theme)
      glow.x = zone.position.x
      glow.y = zone.position.y
      this.worldContainer.addChild(glow)

      const particles: FloatingParticle[] = []
      for (let i = 0; i < MAX_PARTICLES; i++) {
        const particle = createParticle(zone.position.x, zone.position.y, theme)
        this.worldContainer.addChild(particle.graphics)
        particles.push(particle)
      }

      this.objectEntries.push({
        zone,
        sprite,
        baseY: zone.position.y,
        glow,
        particles,
      })
    }

    // --- Player ---
    this.inputManager = new InputManager()
    const textures = generatePlayerTextures(this.app, this.avatar)
    this.playerSprite = new PlayerSprite(textures)
    this.tilemapCollision = new TilemapCollision(OVERWORLD_TILEMAP)

    const spawn = OVERWORLD_TILEMAP.playerSpawn
    this.position = {
      x: (spawn.x + 0.5) * OVERWORLD_TILEMAP.tileSize,
      y: (spawn.y + 0.5) * OVERWORLD_TILEMAP.tileSize,
    }
    this.playerSprite.container.x = this.position.x
    this.playerSprite.container.y = this.position.y
    this.worldContainer.addChild(this.playerSprite.container)

    // --- Interaction manager ---
    this.interactionManager = new InteractionManager(OVERWORLD_TILEMAP.interactionZones, (zone) => {
      this.currentNearbyZoneId = zone?.id ?? null
      this.onNearbyZoneChange?.(zone)
    })

    // --- Visibility change ---
    this.onVisibilityChange = () => {
      if (document.hidden) this.pause()
      else this.resume()
    }
    document.addEventListener('visibilitychange', this.onVisibilityChange)

    // --- Tap-to-walk (convert screen to world coords) ---
    const canvas = this.app.canvas as HTMLCanvasElement
    this.onCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const viewportX = ((e.clientX - rect.left) / rect.width) * VIEWPORT_WIDTH
      const viewportY = ((e.clientY - rect.top) / rect.height) * VIEWPORT_HEIGHT
      const halfW = VIEWPORT_WIDTH / 2
      const halfH = VIEWPORT_HEIGHT / 2
      const camX = Math.max(halfW, Math.min(WORLD_WIDTH - halfW, this.position.x))
      const camY = Math.max(halfH, Math.min(WORLD_HEIGHT - halfH, this.position.y))
      const worldX = camX - halfW + viewportX
      const worldY = camY - halfH + viewportY

      if (this.tilemapCollision.isPassable({ x: worldX, y: worldY })) {
        this.inputManager.setTapTarget({ x: worldX, y: worldY })
      }
    }
    canvas.addEventListener('click', this.onCanvasClick)

    // --- Theme change ---
    this.unsubscribeTheme = getThemeManager().onChange((newTheme) => {
      this.applyTheme(newTheme)
    })

    this.installTileDebugHelpers()
  }

  update(dt: number): void {
    if (this.paused) return
    dt = Math.min(dt, MAX_DT)

    const { dx, dy } = this.inputManager.getMovementVector(this.position, TAP_ARRIVAL_THRESHOLD)
    const isMoving = dx !== 0 || dy !== 0

    if (isMoving) {
      const newX = this.position.x + dx * SPEED * dt
      const newY = this.position.y + dy * SPEED * dt

      const resolved = this.tilemapCollision.resolve(this.position, { x: newX, y: newY })

      this.position = resolved
      this.playerSprite.container.x = resolved.x
      this.playerSprite.container.y = resolved.y

      const dir: Direction =
        Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
      this.playerSprite.setDirection(dir)
      this.playerSprite.setWalking(true)
    } else {
      this.playerSprite.setWalking(false)
    }

    this.playerSprite.update(dt)

    // Camera: center on player, clamped to world bounds (Pokemon-style)
    const halfW = VIEWPORT_WIDTH / 2
    const halfH = VIEWPORT_HEIGHT / 2
    const camX = Math.max(halfW, Math.min(WORLD_WIDTH - halfW, this.position.x))
    const camY = Math.max(halfH, Math.min(WORLD_HEIGHT - halfH, this.position.y))
    this.worldContainer.x = -camX + halfW
    this.worldContainer.y = -camY + halfH

    // Interaction zones
    this.interactionManager.update(this.position)

    // Animate objects
    this.elapsed += dt
    for (const entry of this.objectEntries) {
      const isActive = entry.zone.id === this.currentNearbyZoneId
      const bobSpeed = isActive ? ACTIVE_BOB_SPEED : BOB_SPEED
      const bobAmp = isActive ? ACTIVE_BOB_AMPLITUDE : BOB_AMPLITUDE

      const bobOffset = Math.sin(this.elapsed * bobSpeed) * bobAmp
      entry.sprite.y = entry.baseY + bobOffset
      entry.glow.y = entry.baseY + bobOffset

      const glowBase = isActive ? 0.35 : 0.12
      const glowRange = isActive ? 0.25 : 0.08
      const glowSpeed = isActive ? 4 : 2
      entry.glow.alpha = glowBase + Math.sin(this.elapsed * glowSpeed) * glowRange

      for (const p of entry.particles) {
        if (isActive) {
          p.offsetY += p.speed * dt
          p.alpha = Math.max(0, 1 - p.offsetY / p.maxDrift) * 0.7

          if (p.offsetY >= p.maxDrift) {
            p.offsetY = 0
            p.x = entry.zone.position.x + (Math.random() - 0.5) * 14
            p.graphics.x = p.x
          }

          p.graphics.y = p.baseY - p.offsetY
          p.graphics.alpha = p.alpha
        } else {
          p.graphics.alpha = 0
          p.offsetY = 0
        }
      }
    }
  }

  private applyTheme(theme: Theme): void {
    this.tilemapRenderer.applyTheme(theme)

    for (const entry of this.objectEntries) {
      if (entry.sprite instanceof Graphics) {
        const color = theme === 'dark' ? darkenColor(entry.zone.color, 0.7) : entry.zone.color
        entry.sprite.clear()
        const hw = entry.zone.width / 2
        const hh = entry.zone.height / 2
        entry.sprite.roundRect(-hw, -hh, entry.zone.width, entry.zone.height, 4)
        entry.sprite.fill({ color })
        entry.sprite.stroke({ color: 0x333333, width: 1.5 })
      }

      entry.glow.clear()
      const ghw = entry.zone.width / 2 + 3
      const ghh = entry.zone.height / 2 + 3
      const glowColor = theme === 'dark' ? darkenColor(entry.zone.color, 0.7) : entry.zone.color
      entry.glow.roundRect(-ghw, -ghh, ghw * 2, ghh * 2, 6)
      entry.glow.fill({ color: glowColor, alpha: 0.15 })
    }
  }

  destroy(): void {
    document.removeEventListener('visibilitychange', this.onVisibilityChange)

    const canvas = this.app.canvas as HTMLCanvasElement
    canvas?.removeEventListener('click', this.onCanvasClick)

    this.unsubscribeTheme?.()
    this.inputManager?.destroy()
    this.playerSprite?.destroy()
    this.interactionManager?.destroy()
    this.tilemapRenderer?.destroy()
    this.objectEntries = []
    super.destroy()
  }
}

export { VIEWPORT_WIDTH as SCENE_WIDTH, VIEWPORT_HEIGHT as SCENE_HEIGHT }
