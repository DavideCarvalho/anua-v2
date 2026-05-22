import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Sprout, Star, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../ui/sheet'
import { ISLAND_MAP, TILE, MAP_W, MAP_H, isWalkable } from './island_map'
import { CropSprite } from './crop-sprite'
import type { Plot } from './types'
import { STORE_ITEMS, CANTINA_ITEMS } from './store_items'
import { Slime, Chicken, Cow, Frog, Butterfly, Bee, Beehive } from './island-creatures'

const PIXEL = 3 // each source pixel rendered at 3x → tiles = 48px
const DISPLAY_TILE = TILE * PIXEL // 48

// Map size in pixels
const MAP_PX_W = MAP_W * DISPLAY_TILE
const MAP_PX_H = MAP_H * DISPLAY_TILE

// Player sprite (Farmer_Bob.png is 384x832, tile 32x32)
const PLAYER_BASE_SIZE = 32
const PLAYER_DISPLAY = PLAYER_BASE_SIZE * 4 // 128
const PLAYER_SPEED = 3.5 // px per frame at 60fps

// Building positions (top-left tile coordinate). Spread across the village
// strip in rows 4–8 so the player has to walk across the island to reach them.
const LOJINHA_POS = { tx: 4, ty: 4 } // House: ~3 wide × 4 tall in tiles
const CANTINA_POS = { tx: 22, ty: 4 } // Market stall: ~3 wide × 3 tall
const BIBLIOTECA_POS = { tx: 33, ty: 4 } // 2nd house variant
const ESCOLA_POS = { tx: 44, ty: 4 } // 3rd house variant

// Farm plot positions (each plot 2×2 tiles). Cluster of 4 plots in the
// central meadow, framed by the E-W path.
const PLOT_POSITIONS = [
  { tx: 22, ty: 14 },
  { tx: 25, ty: 14 },
  { tx: 22, ty: 17 },
  { tx: 25, ty: 17 },
]

// Mailbox tile (claim daily seeds)
const MAILBOX_POS = { tx: 17, ty: 9 }

const INTERACT_DISTANCE = 80 // pixels: how close player needs to be

interface IslandSceneProps {
  student: { id: string; name: string }
  plots: Plot[]
  growDurationSeconds: number
  now: number
  totalPoints: number
  seeds: number
  pointsEarnedToday: number
  dailyPointsCap: number
  canClaimDaily: boolean
  onClaimDaily: () => void
  onPlant: (plotId: number) => void
  onHarvest: (plotId: number) => void
  onBuyItem: (item: { name: string; cost: number }) => void
  onExit: () => void
  busy: boolean
}

type Direction = 'down' | 'up' | 'left' | 'right'
type OpenSheet = null | 'lojinha' | 'cantina'

export function IslandScene(props: IslandSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Spawn at the centre of the path in the middle of the island.
  const [pos, setPos] = useState({ x: 23 * DISPLAY_TILE, y: 12 * DISPLAY_TILE + DISPLAY_TILE / 2 })
  const [dir, setDir] = useState<Direction>('down')
  const [walking, setWalking] = useState(false)
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null)
  const keys = useRef<Record<string, boolean>>({})
  const rafRef = useRef<number | null>(null)

  // Keyboard listeners ----------------------------------------------------
  useEffect(() => {
    function down(e: KeyboardEvent) {
      const k = e.key.toLowerCase()
      if (openSheet) return // ignore movement while sheet is open
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'e', ' '].includes(k)) {
        e.preventDefault()
      }
      keys.current[k] = true

      // Interact on E / Space
      if (k === 'e' || k === ' ') {
        tryInteract()
      }
    }
    function up(e: KeyboardEvent) {
      keys.current[e.key.toLowerCase()] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [openSheet, props.plots, props.seeds, props.canClaimDaily])

  // Game loop -------------------------------------------------------------
  useEffect(() => {
    function tick() {
      if (!openSheet) {
        setPos((p) => {
          let dx = 0
          let dy = 0
          const k = keys.current
          if (k['arrowup'] || k['w']) dy -= 1
          if (k['arrowdown'] || k['s']) dy += 1
          if (k['arrowleft'] || k['a']) dx -= 1
          if (k['arrowright'] || k['d']) dx += 1
          if (dx === 0 && dy === 0) {
            if (walking) setWalking(false)
            return p
          }
          if (!walking) setWalking(true)
          // normalize diagonal
          if (dx !== 0 && dy !== 0) {
            dx *= 0.7071
            dy *= 0.7071
          }
          // primary direction (for sprite facing)
          if (Math.abs(dy) > Math.abs(dx)) {
            setDir(() => (dy < 0 ? 'up' : 'down') as Direction)
          } else if (dx !== 0) {
            setDir(() => (dx < 0 ? 'left' : 'right') as Direction)
          }
          const nextX = p.x + dx * PLAYER_SPEED
          const nextY = p.y + dy * PLAYER_SPEED
          // Collision check: use player feet position
          const feetX = nextX
          const feetY = nextY + PLAYER_DISPLAY * 0.35
          if (canStandAt(feetX, feetY)) {
            return { x: nextX, y: nextY }
          }
          // Try axis-locked move
          if (canStandAt(p.x + dx * PLAYER_SPEED, p.y + PLAYER_DISPLAY * 0.35)) {
            return { x: nextX, y: p.y }
          }
          if (canStandAt(p.x, p.y + dy * PLAYER_SPEED + PLAYER_DISPLAY * 0.35)) {
            return { x: p.x, y: nextY }
          }
          return p
        })
      }
      rafRef.current = window.requestAnimationFrame(tick)
    }
    rafRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [openSheet, walking])

  // Detect nearest interactable -----------------------------------------
  const nearest = useMemo(
    () => findNearestInteractable(pos, props.plots),
    [pos, props.plots]
  )

  function tryInteract() {
    if (!nearest) return
    if (nearest.kind === 'lojinha') setOpenSheet('lojinha')
    else if (nearest.kind === 'cantina') setOpenSheet('cantina')
    else if (nearest.kind === 'biblioteca') {
      toast.info('A Biblioteca abre em breve — aguarde os próximos updates!')
    } else if (nearest.kind === 'escola') {
      toast.info('A Escola abre em breve — aguarde os próximos updates!')
    } else if (nearest.kind === 'plot') {
      const plot = props.plots.find((p) => p.id === nearest.plotId)
      if (!plot) return
      if (plot.state === 'empty') props.onPlant(plot.id)
      else if (plot.state === 'ready') props.onHarvest(plot.id)
    } else if (nearest.kind === 'mailbox') {
      if (props.canClaimDaily) props.onClaimDaily()
    }
  }

  // Camera: clamp & center on player ------------------------------------
  const [viewport, setViewport] = useState({ w: 1280, h: 720 })
  useEffect(() => {
    const update = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  // Camera: always follow the player, clamped to map edges.
  const cameraX = clamp(pos.x - viewport.w / 2, 0, Math.max(0, MAP_PX_W - viewport.w))
  const cameraY = clamp(pos.y - viewport.h / 2, 0, Math.max(0, MAP_PX_H - viewport.h))

  // Sprite frame for walk animation -------------------------------------
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    if (!walking) {
      setFrame(0)
      return
    }
    const t = window.setInterval(() => setFrame((f) => (f + 1) % 4), 140)
    return () => window.clearInterval(t)
  }, [walking])

  return (
    <div ref={containerRef} className="relative h-full w-full" tabIndex={0}>
      {/* Sea background — visible behind the map edges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/rpg/cute-fantasy/Water_Middle.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: `${DISPLAY_TILE}px ${DISPLAY_TILE}px`,
          imageRendering: 'pixelated',
          animation: 'fazendinha-water-shift 6s linear infinite',
        }}
      />

      {/* The world: large surface translated by camera */}
      <div
        className="absolute"
        style={{
          left: -cameraX,
          top: -cameraY,
          width: MAP_PX_W,
          height: MAP_PX_H,
          imageRendering: 'pixelated',
        }}
      >
        <TileLayer />

        {/* Buildings */}
        <Lojinha />
        <Cantina />
        <Biblioteca />
        <Escola />

        {/* Mailbox (claim daily) */}
        <Mailbox tx={MAILBOX_POS.tx} ty={MAILBOX_POS.ty} />

        {/* Farm plots */}
        {props.plots.map((plot, i) => (
          <FarmPlot
            key={plot.id}
            plot={plot}
            now={props.now}
            growDurationSeconds={props.growDurationSeconds}
            tx={PLOT_POSITIONS[i].tx}
            ty={PLOT_POSITIONS[i].ty}
          />
        ))}

        {/* === FLORESTA (west) — dense trees + slimes === */}
        <Tree tx={2} ty={12} kind="oak" />
        <Tree tx={4} ty={14} kind="oak" />
        <Tree tx={3} ty={17} kind="small" />
        <Tree tx={5} ty={20} kind="oak" />
        <Tree tx={7} ty={22} kind="small" />
        <Tree tx={2} ty={25} kind="oak" />
        <Tree tx={4} ty={28} kind="small" />
        <Tree tx={6} ty={30} kind="oak" />
        <Tree tx={9} ty={26} kind="small" />
        <Slime color="green" style={{ left: 4 * DISPLAY_TILE, top: 18 * DISPLAY_TILE }} />
        <Slime color="green" style={{ left: 7 * DISPLAY_TILE, top: 24 * DISPLAY_TILE }} />
        <Slime color="blue" style={{ left: 3 * DISPLAY_TILE, top: 27 * DISPLAY_TILE }} />
        <Slime color="pink" style={{ left: 8 * DISPLAY_TILE, top: 21 * DISPLAY_TILE }} />

        {/* === VILA (north) — trees framing the buildings === */}
        <Tree tx={10} ty={3} kind="small" />
        <Tree tx={19} ty={3} kind="small" />
        <Tree tx={30} ty={3} kind="small" />
        <Tree tx={41} ty={3} kind="small" />
        <Flowers tx={9} ty={9} hues={[350, 50]} />
        <Flowers tx={20} ty={10} hues={[290, 20]} />
        <Flowers tx={32} ty={9} hues={[200, 350]} />
        <Flowers tx={42} ty={10} hues={[50, 290]} />

        {/* === FAZENDA (centro) — galinhas, vacas, abelhas === */}
        <Chicken style={{ left: 30 * DISPLAY_TILE, top: 15 * DISPLAY_TILE }} />
        <Chicken style={{ left: 31.5 * DISPLAY_TILE, top: 16 * DISPLAY_TILE }} flip />
        <Chicken style={{ left: 33 * DISPLAY_TILE, top: 15.5 * DISPLAY_TILE }} />
        <Cow style={{ left: 35 * DISPLAY_TILE, top: 22 * DISPLAY_TILE }} />
        <Cow style={{ left: 38 * DISPLAY_TILE, top: 25 * DISPLAY_TILE }} />
        <Beehive style={{ left: 14 * DISPLAY_TILE, top: 14 * DISPLAY_TILE }} />
        <Bee style={{ left: 13.5 * DISPLAY_TILE, top: 13 * DISPLAY_TILE }} />
        <Bee style={{ left: 15 * DISPLAY_TILE, top: 12 * DISPLAY_TILE }} />
        <Flowers tx={13} ty={20} hues={[350, 50, 200]} />
        <Flowers tx={37} ty={18} hues={[20, 290, 50]} />

        {/* === PASTO LESTE === */}
        <Tree tx={42} ty={22} kind="fruit" />
        <Tree tx={45} ty={26} kind="fruit" />
        <Tree tx={40} ty={28} kind="oak" />

        {/* === SUL (lagoa + sapos) === */}
        <Frog style={{ left: 12 * DISPLAY_TILE, top: 30 * DISPLAY_TILE }} />
        <Frog style={{ left: 16 * DISPLAY_TILE, top: 32 * DISPLAY_TILE }} />
        <Tree tx={20} ty={31} kind="oak" />
        <Tree tx={28} ty={30} kind="small" />
        <Tree tx={35} ty={32} kind="oak" />

        {/* === Borboletas voando em vários pontos === */}
        <Butterfly style={{ left: 12 * DISPLAY_TILE, top: 8 * DISPLAY_TILE }} />
        <Butterfly style={{ left: 25 * DISPLAY_TILE, top: 11 * DISPLAY_TILE }} />
        <Butterfly style={{ left: 38 * DISPLAY_TILE, top: 7 * DISPLAY_TILE }} />
        <Butterfly style={{ left: 30 * DISPLAY_TILE, top: 27 * DISPLAY_TILE }} />

        {/* Player */}
        <PlayerSprite
          x={pos.x - PLAYER_DISPLAY / 2}
          y={pos.y - PLAYER_DISPLAY / 2}
          dir={dir}
          frame={frame}
          walking={walking}
        />

        {/* Interaction prompt floating above player */}
        {nearest && (
          <div
            className="pointer-events-none absolute z-30 flex -translate-x-1/2 flex-col items-center"
            style={{
              left: pos.x,
              top: pos.y - PLAYER_DISPLAY,
              fontFamily: 'var(--font-display)',
            }}
          >
            <div className="rounded-2xl border-2 border-[var(--color-gf-navy)] bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--color-gf-navy)] shadow-[0_3px_0_0_var(--color-gf-navy)]">
              {nearestLabel(nearest, props)}
            </div>
            <div className="mt-1 rounded-md bg-[var(--color-gf-navy)] px-1.5 py-0.5 text-[10px] font-bold text-white">
              [E] ou [Espaço]
            </div>
          </div>
        )}
      </div>

      {/* HUD overlay (fixed) ----------------------------------------- */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between p-4">
        <button
          type="button"
          onClick={props.onExit}
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-2xl border-2 border-[var(--color-gf-navy)] bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-gf-navy)] shadow-[0_3px_0_0_var(--color-gf-navy)] backdrop-blur transition-transform hover:-translate-y-0.5"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.75} />
          Sair
        </button>

        <div className="flex gap-2">
          <HudPill icon={<Star className="h-4 w-4" />} label="Pontos" value={props.totalPoints} tone="gold" />
          <HudPill icon={<Sprout className="h-4 w-4" />} label="Sementes" value={props.seeds} tone="primary" />
          <HudPill
            icon={<Sparkles className="h-4 w-4" />}
            label="Hoje"
            value={`${props.pointsEarnedToday}/${props.dailyPointsCap}`}
            tone={props.pointsEarnedToday >= props.dailyPointsCap ? 'muted' : 'accent'}
          />
        </div>
      </header>

      {/* Controls hint */}
      <div
        className="pointer-events-none absolute bottom-4 left-4 z-40 rounded-2xl border-2 border-[var(--color-gf-navy)] bg-white/85 px-3 py-2 text-xs text-[var(--color-gf-navy)] shadow-[0_3px_0_0_var(--color-gf-navy)] backdrop-blur"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <div className="font-bold uppercase tracking-wider">Controles</div>
        <div className="mt-1 space-y-0.5 text-[11px]">
          <div>↑ ↓ ← → ou W A S D — andar</div>
          <div>[E] / [Espaço] — interagir</div>
        </div>
      </div>

      {/* Sheets ---------------------------------------------------- */}
      <Sheet open={openSheet === 'lojinha'} onOpenChange={(o) => !o && setOpenSheet(null)}>
        <SheetContent
          side="right"
          className="gamified z-[120] w-full overflow-y-auto sm:max-w-md"
          style={{ background: 'var(--color-gf-cream)' }}
        >
          <SheetHeader>
            <SheetTitle
              className="text-3xl text-[var(--color-gf-navy)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              🏠 Lojinha da Escola
            </SheetTitle>
            <SheetDescription className="text-[var(--color-gf-navy)]/70">
              Troque seus pontos por itens incríveis!
            </SheetDescription>
          </SheetHeader>
          <ItemList items={STORE_ITEMS} totalPoints={props.totalPoints} onBuy={props.onBuyItem} />
        </SheetContent>
      </Sheet>

      <Sheet open={openSheet === 'cantina'} onOpenChange={(o) => !o && setOpenSheet(null)}>
        <SheetContent
          side="right"
          className="gamified z-[120] w-full overflow-y-auto sm:max-w-md"
          style={{ background: 'var(--color-gf-cream)' }}
        >
          <SheetHeader>
            <SheetTitle
              className="text-3xl text-[var(--color-gf-navy)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              🍔 Cantina
            </SheetTitle>
            <SheetDescription className="text-[var(--color-gf-navy)]/70">
              Lanches deliciosos com seus pontos da fazenda!
            </SheetDescription>
          </SheetHeader>
          <ItemList items={CANTINA_ITEMS} totalPoints={props.totalPoints} onBuy={props.onBuyItem} />
        </SheetContent>
      </Sheet>

      {/* Global styles for sprite animations -------------------------- */}
      <style>{`
        @keyframes fazendinha-water-shift {
          from { background-position: 0 0; }
          to { background-position: ${DISPLAY_TILE}px ${DISPLAY_TILE}px; }
        }
        @keyframes fazendinha-mailbox-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes fazendinha-plot-ready-pulse {
          0%, 100% { transform: translateY(0) scale(1); filter: brightness(1); }
          50% { transform: translateY(-2px) scale(1.04); filter: brightness(1.12); }
        }
        @keyframes fazendinha-sparkle-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fazendinha-flower-sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes fazendinha-player-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes fazendinha-butterfly-float {
          0% { transform: translate(0, 0); }
          25% { transform: translate(16px, -10px); }
          50% { transform: translate(32px, 4px); }
          75% { transform: translate(14px, -14px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes fazendinha-bee-buzz {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(10px, -6px); }
          50% { transform: translate(20px, 2px); }
          75% { transform: translate(6px, -10px); }
        }
      `}</style>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
 * HUD pill
 * ──────────────────────────────────────────────────────── */

type Tone = 'gold' | 'primary' | 'accent' | 'muted'
const TONE_BG: Record<Tone, string> = {
  gold: 'var(--color-gf-gold)',
  primary: 'var(--color-gf-primary)',
  accent: 'var(--color-gf-accent)',
  muted: 'var(--color-gf-secondary)',
}
const TONE_FG: Record<Tone, string> = {
  gold: 'var(--color-gf-navy)',
  primary: 'white',
  accent: 'white',
  muted: 'var(--color-gf-navy)',
}

function HudPill({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  tone: Tone
}) {
  return (
    <div
      className="pointer-events-auto flex items-stretch overflow-hidden rounded-2xl border-2 border-[var(--color-gf-navy)] shadow-[0_3px_0_0_var(--color-gf-navy)]"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
        style={{ backgroundColor: TONE_BG[tone], color: TONE_FG[tone] }}
      >
        <span aria-hidden>{icon}</span>
        {label}
      </div>
      <div className="flex items-center bg-white px-2.5 text-base font-bold text-[var(--color-gf-navy)] tabular-nums">
        {value}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
 * Item list (Sheet content)
 * ──────────────────────────────────────────────────────── */

function ItemList({
  items,
  totalPoints,
  onBuy,
}: {
  items: ReadonlyArray<{ name: string; emoji: string; cost: number; description?: string }>
  totalPoints: number
  onBuy: (item: { name: string; cost: number }) => void
}) {
  return (
    <ul className="mt-4 grid gap-2.5">
      {items.map((item) => {
        const canAfford = totalPoints >= item.cost
        return (
          <li key={item.name}>
            <button
              type="button"
              onClick={() => onBuy(item)}
              disabled={!canAfford}
              className="group flex w-full items-center gap-3 rounded-2xl border-4 border-[var(--color-gf-navy)] bg-white p-3 text-left shadow-[0_4px_0_0_var(--color-gf-navy)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--color-gf-navy)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <span className="text-3xl">{item.emoji}</span>
              <div className="flex-1">
                <div
                  className="text-base font-bold text-[var(--color-gf-navy)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {item.name}
                </div>
                {item.description && (
                  <div className="text-xs text-[var(--color-gf-navy)]/70">{item.description}</div>
                )}
              </div>
              <div
                className="flex items-center gap-1 rounded-full border-2 border-[var(--color-gf-navy)] bg-[var(--color-gf-gold)] px-2.5 py-1 text-sm font-bold text-[var(--color-gf-navy)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <Star className="h-3.5 w-3.5" strokeWidth={2.75} />
                {item.cost}
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/* ──────────────────────────────────────────────────────────
 * Tilemap layer
 * ──────────────────────────────────────────────────────── */

function repeatedBlades(): string {
  // Inline SVG of 3 tiny "V" grass blades repeated as a background pattern.
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'>
    <g fill='#2f7a3a' opacity='0.85'>
      <path d='M6 14 L7 10 L8 14 Z'/>
      <path d='M22 32 L23 28 L24 32 Z'/>
      <path d='M38 6 L39 2 L40 6 Z'/>
      <path d='M16 40 L17 36 L18 40 Z'/>
      <path d='M34 24 L35 20 L36 24 Z'/>
    </g>
    <g fill='#7fcb84' opacity='0.6'>
      <rect x='12' y='18' width='1' height='2'/>
      <rect x='28' y='8'  width='1' height='2'/>
      <rect x='4'  y='28' width='1' height='2'/>
      <rect x='42' y='32' width='1' height='2'/>
    </g>
  </svg>`
  const encoded = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22')
  return `url("data:image/svg+xml,${encoded}")`
}

function TileLayer() {
  // Group tiles into a single big background block per zone so we don't see
  // 1px seams between repeated tiles. We render water as a flat color tinted
  // gradient, sand as a smooth tan, grass as the Grass_2_Middle texture
  // tiled, and paths tile-by-tile.
  return (
    <div className="absolute inset-0">
      {/* Solid background = water across the whole map */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/rpg/cute-fantasy/Water_Middle.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: `${DISPLAY_TILE}px ${DISPLAY_TILE}px`,
          imageRendering: 'pixelated',
        }}
      />

      {/* Soft round island shape: foam ring + sand + grass plateau. Placed
          UNDER the discrete tile layer so paths still show on top. */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: DISPLAY_TILE * 0.5,
          top: DISPLAY_TILE * 0.5,
          width: DISPLAY_TILE * (MAP_W - 1),
          height: DISPLAY_TILE * (MAP_H - 1),
          borderRadius: '46% 50% 48% 52% / 50% 46% 52% 48%',
          background:
            'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 24%), #f4d491',
          boxShadow:
            '0 0 0 10px rgba(255,255,255,0.45), 0 0 0 22px rgba(173, 216, 230, 0.35), 0 0 32px 16px rgba(15, 75, 130, 0.45)',
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          left: DISPLAY_TILE * 1.5,
          top: DISPLAY_TILE * 1.5,
          width: DISPLAY_TILE * (MAP_W - 3),
          height: DISPLAY_TILE * (MAP_H - 3),
          borderRadius: '44% 48% 50% 46% / 48% 50% 46% 52%',
          // Layered grass: flat tile + sparse "grass blades" texture + tonal
          // patches. Together they give the pixel-art grass field feel.
          backgroundColor: '#4ea759',
          backgroundImage:
            // tiny darker dots scattered
            `radial-gradient(circle at 20% 30%, #2f7a3a 0 1.5px, transparent 1.6px),
             radial-gradient(circle at 70% 60%, #2f7a3a 0 1.5px, transparent 1.6px),
             radial-gradient(circle at 45% 80%, #2f7a3a 0 1.5px, transparent 1.6px),
             radial-gradient(circle at 88% 22%, #2f7a3a 0 1.5px, transparent 1.6px),
             radial-gradient(circle at 12% 70%, #2f7a3a 0 1.5px, transparent 1.6px),
             ${repeatedBlades()},
             url(/rpg/cute-fantasy/Grass_2_Middle.png)`,
          backgroundSize: `16px 16px, 24px 24px, 20px 20px, 28px 28px, 18px 18px, 48px 48px, ${DISPLAY_TILE}px ${DISPLAY_TILE}px`,
          backgroundRepeat: 'repeat',
          imageRendering: 'pixelated',
          boxShadow:
            'inset 0 0 0 3px rgba(60, 100, 40, 0.25), 0 2px 0 0 rgba(60, 100, 40, 0.3)',
        }}
      />
      {/* Subtle patches of slightly different green for organic feel */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: DISPLAY_TILE * 1.5,
          top: DISPLAY_TILE * 1.5,
          width: DISPLAY_TILE * (MAP_W - 3),
          height: DISPLAY_TILE * (MAP_H - 3),
          borderRadius: '44% 48% 50% 46% / 48% 50% 46% 52%',
          backgroundImage:
            `radial-gradient(ellipse 80px 60px at 20% 25%, rgba(120, 200, 130, 0.45), transparent 70%),
             radial-gradient(ellipse 100px 80px at 70% 40%, rgba(60, 130, 70, 0.35), transparent 70%),
             radial-gradient(ellipse 90px 70px at 35% 75%, rgba(140, 220, 150, 0.4), transparent 70%),
             radial-gradient(ellipse 80px 70px at 85% 80%, rgba(80, 150, 90, 0.35), transparent 70%),
             radial-gradient(ellipse 110px 90px at 50% 50%, rgba(160, 230, 170, 0.3), transparent 75%)`,
          backgroundSize: '400px 400px',
          backgroundRepeat: 'repeat',
          mixBlendMode: 'soft-light',
        }}
      />

      {/* Discrete path tiles laid ON TOP of the smooth island */}
      {ISLAND_MAP.map((row, y) =>
        row.map((tile, x) => {
          if (tile !== 'path') return null
          return (
            <div
              key={`p${x},${y}`}
              className="absolute"
              style={{
                left: x * DISPLAY_TILE,
                top: y * DISPLAY_TILE,
                width: DISPLAY_TILE,
                height: DISPLAY_TILE,
                backgroundImage: 'url(/rpg/cute-fantasy/Path_Middle.png)',
                backgroundSize: `${DISPLAY_TILE}px ${DISPLAY_TILE}px`,
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
              }}
            />
          )
        })
      )}

      {/* Soft vignette over the world for atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(15, 23, 42, 0.32) 100%)',
        }}
      />
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
 * Buildings & decorations
 * ──────────────────────────────────────────────────────── */

function GroundShadow({ width, top, left }: { width: number; top: number; left: number }) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left,
        top,
        width,
        height: width * 0.18,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(15,23,42,0.45), transparent 70%)',
        filter: 'blur(4px)',
      }}
    />
  )
}

function Lojinha() {
  const SCALE = 3 // 96x128 → 288x384
  const W = 96 * SCALE
  const H = 128 * SCALE
  return (
    <>
      <GroundShadow
        left={LOJINHA_POS.tx * DISPLAY_TILE - 12}
        top={LOJINHA_POS.ty * DISPLAY_TILE + H - 28}
        width={W + 24}
      />
      <div
        className="absolute"
        style={{
          left: LOJINHA_POS.tx * DISPLAY_TILE,
          top: LOJINHA_POS.ty * DISPLAY_TILE,
          width: W,
          height: H,
          backgroundImage: 'url(/rpg/cute-fantasy/House_1_Wood_Base_Red.png)',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          filter:
            'drop-shadow(0 10px 6px rgba(15,23,42,0.35)) drop-shadow(3px 4px 0 rgba(15,23,42,0.25))',
        }}
      >
        <Signboard label="Lojinha" />
      </div>
    </>
  )
}

function Cantina() {
  // Market_Stalls.png is 192x48 (4 stalls). Use one stall (48x48 region) scaled up.
  const SCALE = 4
  const W = 48 * SCALE
  const H = 48 * SCALE
  return (
    <>
      <GroundShadow
        left={CANTINA_POS.tx * DISPLAY_TILE - 8}
        top={CANTINA_POS.ty * DISPLAY_TILE + 48 + H - 24}
        width={W + 16}
      />
      <div
        className="absolute"
        style={{
          left: CANTINA_POS.tx * DISPLAY_TILE,
          top: CANTINA_POS.ty * DISPLAY_TILE + 48,
          width: W,
          height: H,
          backgroundImage: 'url(/rpg/cute-fantasy/Market_Stalls.png)',
          backgroundSize: `${192 * SCALE}px ${48 * SCALE}px`,
          backgroundPosition: `0 0`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          filter:
            'drop-shadow(0 8px 6px rgba(15,23,42,0.35)) drop-shadow(3px 4px 0 rgba(15,23,42,0.25))',
        }}
      >
        <Signboard label="Cantina" />
      </div>
    </>
  )
}

function Biblioteca() {
  // Reuse House sprite, but tinted blue via filter for differentiation.
  const SCALE = 3
  const W = 96 * SCALE
  const H = 128 * SCALE
  return (
    <>
      <GroundShadow
        left={BIBLIOTECA_POS.tx * DISPLAY_TILE - 12}
        top={BIBLIOTECA_POS.ty * DISPLAY_TILE + H - 28}
        width={W + 24}
      />
      <div
        className="absolute"
        style={{
          left: BIBLIOTECA_POS.tx * DISPLAY_TILE,
          top: BIBLIOTECA_POS.ty * DISPLAY_TILE,
          width: W,
          height: H,
          backgroundImage: 'url(/rpg/cute-fantasy/House_1_Wood_Base_Red.png)',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          filter:
            'hue-rotate(-130deg) saturate(0.9) drop-shadow(0 10px 6px rgba(15,23,42,0.35)) drop-shadow(3px 4px 0 rgba(15,23,42,0.25))',
        }}
      >
        <Signboard label="Biblioteca" />
      </div>
    </>
  )
}

function Escola() {
  // Reuse House sprite, tinted green.
  const SCALE = 3
  const W = 96 * SCALE
  const H = 128 * SCALE
  return (
    <>
      <GroundShadow
        left={ESCOLA_POS.tx * DISPLAY_TILE - 12}
        top={ESCOLA_POS.ty * DISPLAY_TILE + H - 28}
        width={W + 24}
      />
      <div
        className="absolute"
        style={{
          left: ESCOLA_POS.tx * DISPLAY_TILE,
          top: ESCOLA_POS.ty * DISPLAY_TILE,
          width: W,
          height: H,
          backgroundImage: 'url(/rpg/cute-fantasy/House_1_Wood_Base_Red.png)',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          filter:
            'hue-rotate(80deg) saturate(0.85) drop-shadow(0 10px 6px rgba(15,23,42,0.35)) drop-shadow(3px 4px 0 rgba(15,23,42,0.25))',
        }}
      >
        <Signboard label="Escola" />
      </div>
    </>
  )
}

function Signboard({ label }: { label: string }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-[var(--color-gf-navy)] bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gf-navy)] shadow-[0_2px_0_0_var(--color-gf-navy)]"
      style={{
        bottom: -22,
        fontFamily: 'var(--font-display)',
      }}
    >
      {label}
    </div>
  )
}

type TreeKind = 'fruit' | 'oak' | 'small'

const TREE_CFG: Record<
  TreeKind,
  { src: string; sheetW: number; sheetH: number; frameX: number; frameY: number; w: number; h: number }
> = {
  // Medium_Fruit_Tree.png is 96x64 — rightmost 32x64 frame is the full tree
  fruit: { src: '/images/farm/tree_fruit.png', sheetW: 96, sheetH: 64, frameX: 32, frameY: 0, w: 32, h: 64 },
  // Medium_Oak_Tree.png 96x48 — use rightmost 32x48
  oak: { src: '/images/farm/tree_oak.png', sheetW: 96, sheetH: 48, frameX: 32, frameY: 0, w: 32, h: 48 },
  // Small_Fruit_Tree.png 96x64 — use rightmost 32x64
  small: { src: '/images/farm/tree_small.png', sheetW: 96, sheetH: 64, frameX: 32, frameY: 0, w: 32, h: 64 },
}

function Tree({ tx, ty, kind = 'fruit' }: { tx: number; ty: number; kind?: TreeKind }) {
  const SCALE = 3
  const cfg = TREE_CFG[kind]
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: tx * DISPLAY_TILE - 16,
        top: ty * DISPLAY_TILE - cfg.h * SCALE + DISPLAY_TILE,
        width: cfg.w * SCALE,
        height: cfg.h * SCALE,
        backgroundImage: `url(${cfg.src})`,
        backgroundSize: `${cfg.sheetW * SCALE}px ${cfg.sheetH * SCALE}px`,
        backgroundPosition: `-${cfg.frameX * SCALE}px -${cfg.frameY * SCALE}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        filter: 'drop-shadow(2px 5px 0 rgba(15, 23, 42, 0.25))',
      }}
    />
  )
}

function Flowers({ tx, ty, hues }: { tx: number; ty: number; hues: number[] }) {
  return (
    <div
      className="pointer-events-none absolute flex gap-2"
      style={{ left: tx * DISPLAY_TILE, top: ty * DISPLAY_TILE + 18 }}
    >
      {hues.map((h, i) => (
        <CssFlower key={i} hue={h} />
      ))}
    </div>
  )
}

function CssFlower({ hue }: { hue: number }) {
  const petal = `hsl(${hue} 85% 65%)`
  const petalDark = `hsl(${hue} 75% 45%)`
  const SIZE = 4
  return (
    <div
      className="relative"
      style={{
        width: SIZE * 6,
        height: SIZE * 9,
        transformOrigin: 'bottom center',
        animation: 'fazendinha-flower-sway 3s ease-in-out infinite',
      }}
    >
      <div
        className="absolute"
        style={{
          left: '50%',
          bottom: 0,
          transform: 'translateX(-50%)',
          width: SIZE,
          height: SIZE * 5,
          backgroundColor: '#2f7a3a',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
          width: SIZE * 4.5,
          height: SIZE * 4.5,
          backgroundColor: petal,
          boxShadow: `inset -2px -2px 0 0 ${petalDark}, 0 1px 0 0 rgba(15,23,42,0.25)`,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          left: '50%',
          top: SIZE * 1.5,
          transform: 'translateX(-50%)',
          width: SIZE * 1.6,
          height: SIZE * 1.6,
          backgroundColor: '#facc15',
        }}
      />
    </div>
  )
}

function Mailbox({ tx, ty }: { tx: number; ty: number }) {
  return (
    <div
      className="absolute"
      style={{
        left: tx * DISPLAY_TILE + 4,
        top: ty * DISPLAY_TILE + 4,
        animation: 'fazendinha-mailbox-bob 2s ease-in-out infinite',
        filter: 'drop-shadow(2px 4px 0 rgba(15,23,42,0.2))',
      }}
    >
      {/* CSS pixel mailbox */}
      <div className="relative" style={{ width: 40, height: 56 }}>
        {/* post */}
        <div
          className="absolute"
          style={{ left: 16, bottom: 0, width: 8, height: 28, background: '#92400e' }}
        />
        {/* box body */}
        <div
          className="absolute"
          style={{
            left: 4,
            top: 4,
            width: 32,
            height: 22,
            background: '#0d9488',
            borderRadius: '4px 4px 0 0',
            boxShadow:
              'inset -2px -2px 0 0 #065f56, inset 2px 2px 0 0 #2dd4bf, 0 2px 0 0 rgba(0,0,0,0.2)',
          }}
        />
        {/* flag */}
        <div
          className="absolute"
          style={{
            left: 36,
            top: 8,
            width: 4,
            height: 12,
            background: '#ef4444',
          }}
        />
        {/* slot */}
        <div
          className="absolute"
          style={{
            left: 10,
            top: 14,
            width: 20,
            height: 4,
            background: '#0f172a',
            borderRadius: 2,
          }}
        />
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-[var(--color-gf-navy)] bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-gf-navy)] shadow-[0_2px_0_0_var(--color-gf-navy)]"
        style={{ bottom: -18, fontFamily: 'var(--font-display)' }}
      >
        Sementes
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
 * Farm plot
 * ──────────────────────────────────────────────────────── */

function FarmPlot({
  plot,
  tx,
  ty,
  now,
  growDurationSeconds,
}: {
  plot: Plot
  tx: number
  ty: number
  now: number
  growDurationSeconds: number
}) {
  const isReady = plot.state === 'ready'
  const isEmpty = plot.state === 'empty'
  const progress = computeProgress(plot, growDurationSeconds, now)
  const stage = computeStage(progress)
  const SIZE = DISPLAY_TILE * 2 // 2x2 tiles
  return (
    <div
      className="absolute"
      style={{
        left: tx * DISPLAY_TILE,
        top: ty * DISPLAY_TILE,
        width: SIZE,
        height: SIZE,
        background:
          'linear-gradient(180deg, #a36138 0%, #8b5128 60%, #6e3f1f 100%)',
        boxShadow:
          'inset 0 2px 0 0 #c98456, inset 0 -3px 0 0 #5c3219, inset 3px 0 0 0 #5c3219, inset -3px 0 0 0 #5c3219, 0 4px 0 0 rgba(15, 23, 42, 0.35), 0 8px 16px -4px rgba(15, 23, 42, 0.45)',
        borderRadius: 8,
        animation: isReady ? 'fazendinha-plot-ready-pulse 1.2s ease-in-out infinite' : undefined,
      }}
    >
      {/* soil texture: dotted darker spots */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(60, 30, 12, 0.6) 1px, transparent 1.5px)',
          backgroundSize: '10px 10px',
          borderRadius: 8,
        }}
      />
      {/* furrow lines */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, transparent 0, transparent 18px, rgba(60, 30, 12, 0.22) 18px, rgba(60, 30, 12, 0.22) 20px)',
          borderRadius: 8,
        }}
      />
      {!isEmpty && (
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <div style={{ width: '60%', height: '88%' }}>
            <CropSprite stage={stage} cropType={plot.cropType ?? 'carrot'} pixel={4} />
          </div>
        </div>
      )}
      {isReady && (
        <div
          className="pointer-events-none absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-gf-gold)] ring-2 ring-[var(--color-gf-navy)] shadow-[0_2px_0_0_var(--color-gf-navy)]"
          style={{ animation: 'fazendinha-sparkle-spin 4s linear infinite' }}
        >
          <span>✨</span>
        </div>
      )}
      {plot.state === 'growing' && (
        <div
          className="pointer-events-none absolute bottom-1 left-1 right-1 flex items-center justify-center"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <div className="flex w-full items-center gap-1 rounded-full bg-black/65 px-1.5 py-0.5 text-[10px] font-bold text-white">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full bg-[var(--color-gf-gold)] transition-[width] duration-500"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
 * Player sprite
 * ──────────────────────────────────────────────────────── */

function PlayerSprite({
  x,
  y,
  dir,
  frame,
  walking,
}: {
  x: number
  y: number
  dir: Direction
  frame: number
  walking: boolean
}) {
  // Mystic Woods player.png — 288×480 = 6 cols × 10 rows of 48×48 frames.
  // Per the official README:
  //   rows 0-2: idle (down / side / up)
  //   rows 3-5: move (down / side / up)
  //   rows 6-8: attack (down / side / up)
  //   row  9  : death
  // 6 frames per row. Left-facing = flip horizontal of side row.
  const SCALE = 3 // 48px source → 144px display
  const SHEET_W = 288 * SCALE
  const SHEET_H = 480 * SCALE
  const FRAME = 48 * SCALE

  const rowMap: Record<Direction, { idle: number; walk: number }> = {
    down: { idle: 0, walk: 3 },
    left: { idle: 1, walk: 4 },
    right: { idle: 1, walk: 4 },
    up: { idle: 2, walk: 5 },
  }
  const row = walking ? rowMap[dir].walk : rowMap[dir].idle
  const col = frame % 6
  const flip = dir === 'left'

  return (
    <div
      className="absolute z-20"
      style={{
        left: x - (FRAME - PLAYER_DISPLAY) / 2,
        top: y - (FRAME - PLAYER_DISPLAY) / 2,
        width: FRAME,
        height: FRAME,
        imageRendering: 'pixelated',
        transform: flip ? 'scaleX(-1)' : undefined,
      }}
    >
      {/* ground shadow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black/40 blur-[3px]"
        style={{ bottom: FRAME * 0.22, width: FRAME * 0.45, height: 10 }}
      />
      {/* sprite */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/farm/mw_player.png)',
          backgroundSize: `${SHEET_W}px ${SHEET_H}px`,
          backgroundPosition: `-${col * FRAME}px -${row * FRAME}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          filter: 'drop-shadow(2px 4px 0 rgba(15,23,42,0.4))',
        }}
      />
    </div>
  )
}

function PixelRect({
  color,
  left,
  top,
  w,
  h,
}: {
  color: string
  left: number
  top: number
  w: number
  h: number
}) {
  return (
    <div
      className="absolute"
      style={{ left, top, width: w, height: h, backgroundColor: color }}
    />
  )
}

export function PlayerSpriteCSS({
  x,
  y,
  dir,
  frame,
  walking,
}: {
  x: number
  y: number
  dir: Direction
  frame: number
  walking: boolean
}) {
  // Player drawn as CSS pixel art. 16-pixel grid scaled up — full control.
  // PLAYER_DISPLAY is the full bounding box (128px); we draw inside it.
  const P = PLAYER_DISPLAY / 16 // "pixel" size in render
  const isSide = dir === 'left' || dir === 'right'
  const facingUp = dir === 'up'
  const flip = dir === 'left'
  const bob = walking ? (frame % 2 === 0 ? 0 : -P) : 0 // small body bounce
  const legSwap = walking && frame % 2 === 0 // alternate legs

  // Color palette
  const HAT = '#fcd34d'
  const HAT_SHADOW = '#b45309'
  const SKIN = '#fbbf24' // tan
  const SKIN_DARK = '#b45309'
  const SHIRT = '#0ea5e9' // sky blue
  const SHIRT_DARK = '#075985'
  const PANTS = '#7c2d12'
  const PANTS_DARK = '#451a03'
  const SHOE = '#1f2937'

  return (
    <div
      className="absolute z-20"
      style={{
        left: x,
        top: y,
        width: PLAYER_DISPLAY,
        height: PLAYER_DISPLAY,
        transform: flip ? 'scaleX(-1)' : undefined,
        imageRendering: 'pixelated',
      }}
    >
      {/* ground shadow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black/35 blur-[3px]"
        style={{ bottom: P * 0.5, width: P * 9, height: P * 2.5 }}
      />

      {/* body wrap: shifts up/down by 1 'pixel' when walking for bounce */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ transform: `translateY(${bob}px)`, height: '100%' }}
      >
        {/* hat brim */}
        <PixelRect color={HAT} left={3 * P} top={1 * P} w={10 * P} h={P} />
        <PixelRect color={HAT_SHADOW} left={3 * P} top={2 * P} w={10 * P} h={P * 0.6} />
        {/* hat top */}
        <PixelRect color={HAT} left={5 * P} top={0} w={6 * P} h={2 * P} />
        <PixelRect color={HAT_SHADOW} left={5 * P} top={0} w={P} h={2 * P} />

        {/* head */}
        <PixelRect color={SKIN} left={5 * P} top={2.5 * P} w={6 * P} h={3.5 * P} />
        <PixelRect color={SKIN_DARK} left={5 * P} top={5 * P} w={6 * P} h={P} />

        {/* eyes (only when facing down or side) */}
        {!facingUp && (
          <>
            {isSide ? (
              <PixelRect color="#0f172a" left={9 * P} top={4 * P} w={P} h={P} />
            ) : (
              <>
                <PixelRect color="#0f172a" left={6.5 * P} top={4 * P} w={P} h={P} />
                <PixelRect color="#0f172a" left={9 * P} top={4 * P} w={P} h={P} />
              </>
            )}
          </>
        )}

        {/* body (shirt) */}
        <PixelRect color={SHIRT} left={4 * P} top={6 * P} w={8 * P} h={4 * P} />
        <PixelRect color={SHIRT_DARK} left={4 * P} top={9 * P} w={8 * P} h={P} />
        {/* shirt collar */}
        <PixelRect color={SHIRT_DARK} left={7 * P} top={6 * P} w={2 * P} h={P} />

        {/* arms — swing while walking */}
        {!facingUp && (
          <>
            <PixelRect
              color={SKIN}
              left={3 * P}
              top={(walking ? 6.5 : 7) * P}
              w={P * 1.5}
              h={3 * P}
            />
            <PixelRect
              color={SKIN}
              left={11.5 * P}
              top={(walking ? 7 : 6.5) * P}
              w={P * 1.5}
              h={3 * P}
            />
          </>
        )}

        {/* legs (pants) — alternate for walk */}
        <PixelRect
          color={PANTS}
          left={5 * P}
          top={(walking && legSwap ? 9.5 : 10) * P}
          w={2.5 * P}
          h={3.5 * P}
        />
        <PixelRect
          color={PANTS}
          left={8.5 * P}
          top={(walking && !legSwap ? 9.5 : 10) * P}
          w={2.5 * P}
          h={3.5 * P}
        />
        <PixelRect color={PANTS_DARK} left={5 * P} top={13 * P} w={2.5 * P} h={P * 0.5} />
        <PixelRect color={PANTS_DARK} left={8.5 * P} top={13 * P} w={2.5 * P} h={P * 0.5} />

        {/* shoes */}
        <PixelRect color={SHOE} left={5 * P} top={13.5 * P} w={2.5 * P} h={P} />
        <PixelRect color={SHOE} left={8.5 * P} top={13.5 * P} w={2.5 * P} h={P} />
      </div>
    </div>
  )
}

export function _PixelRectUnused({
  color,
  left,
  top,
  w,
  h,
}: {
  color: string
  left: number
  top: number
  w: number
  h: number
}) {
  return (
    <div
      className="absolute"
      style={{
        left,
        top,
        width: w,
        height: h,
        backgroundColor: color,
      }}
    />
  )
}

/* ──────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────── */

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function canStandAt(px: number, py: number): boolean {
  const tx = Math.floor(px / DISPLAY_TILE)
  const ty = Math.floor(py / DISPLAY_TILE)
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return false
  const tile = ISLAND_MAP[ty]?.[tx]
  if (!tile) return false
  if (!isWalkable(tile)) return false

  // Collide with building footprints
  if (inRect(tx, ty, LOJINHA_POS.tx, LOJINHA_POS.ty, 3, 3)) return false
  if (inRect(tx, ty, CANTINA_POS.tx, CANTINA_POS.ty + 1, 3, 2)) return false
  if (inRect(tx, ty, BIBLIOTECA_POS.tx, BIBLIOTECA_POS.ty, 3, 3)) return false
  if (inRect(tx, ty, ESCOLA_POS.tx, ESCOLA_POS.ty, 3, 3)) return false
  // Collide with plot tiles
  for (const p of PLOT_POSITIONS) {
    if (inRect(tx, ty, p.tx, p.ty, 2, 2)) return false
  }
  return true
}

function inRect(tx: number, ty: number, rx: number, ry: number, w: number, h: number) {
  return tx >= rx && tx < rx + w && ty >= ry && ty < ry + h
}

type Interactable =
  | { kind: 'lojinha' }
  | { kind: 'cantina' }
  | { kind: 'biblioteca' }
  | { kind: 'escola' }
  | { kind: 'mailbox' }
  | { kind: 'plot'; plotId: number }

function findNearestInteractable(
  pos: { x: number; y: number },
  plots: Plot[]
): Interactable | null {
  const targets: Array<{ x: number; y: number; data: Interactable }> = [
    {
      x: (LOJINHA_POS.tx + 1.5) * DISPLAY_TILE,
      y: (LOJINHA_POS.ty + 3) * DISPLAY_TILE,
      data: { kind: 'lojinha' },
    },
    {
      x: (CANTINA_POS.tx + 1.5) * DISPLAY_TILE,
      y: (CANTINA_POS.ty + 3) * DISPLAY_TILE,
      data: { kind: 'cantina' },
    },
    {
      x: (BIBLIOTECA_POS.tx + 1.5) * DISPLAY_TILE,
      y: (BIBLIOTECA_POS.ty + 3) * DISPLAY_TILE,
      data: { kind: 'biblioteca' },
    },
    {
      x: (ESCOLA_POS.tx + 1.5) * DISPLAY_TILE,
      y: (ESCOLA_POS.ty + 3) * DISPLAY_TILE,
      data: { kind: 'escola' },
    },
    {
      x: (MAILBOX_POS.tx + 0.5) * DISPLAY_TILE,
      y: (MAILBOX_POS.ty + 0.5) * DISPLAY_TILE,
      data: { kind: 'mailbox' },
    },
  ]
  plots.forEach((p, i) => {
    const tp = PLOT_POSITIONS[i]
    if (!tp) return
    targets.push({
      x: (tp.tx + 1) * DISPLAY_TILE,
      y: (tp.ty + 1) * DISPLAY_TILE,
      data: { kind: 'plot', plotId: p.id },
    })
  })
  let best: { d: number; t: Interactable } | null = null
  for (const t of targets) {
    const d = Math.hypot(t.x - pos.x, t.y - pos.y)
    if (d < INTERACT_DISTANCE && (!best || d < best.d)) {
      best = { d, t: t.data }
    }
  }
  return best?.t ?? null
}

function nearestLabel(item: Interactable, props: IslandSceneProps): string {
  switch (item.kind) {
    case 'lojinha':
      return 'Entrar na Lojinha'
    case 'cantina':
      return 'Entrar na Cantina'
    case 'biblioteca':
      return 'Entrar na Biblioteca'
    case 'escola':
      return 'Entrar na Escola'
    case 'mailbox':
      return props.canClaimDaily ? 'Pegar sementes diárias' : 'Sementes já pegas hoje'
    case 'plot': {
      const plot = props.plots.find((p) => p.id === item.plotId)
      if (!plot) return ''
      if (plot.state === 'empty')
        return props.seeds > 0 ? 'Plantar (1 semente)' : 'Sem sementes!'
      if (plot.state === 'growing') return 'Crescendo…'
      return 'Colher!'
    }
  }
}

function computeProgress(plot: Plot, growDurationSeconds: number, now: number): number {
  if (plot.state === 'ready') return 1
  if (plot.state !== 'growing' || !plot.plantedAt) return 0
  const elapsed = (now - new Date(plot.plantedAt).getTime()) / 1000
  return Math.max(0, Math.min(1, elapsed / growDurationSeconds))
}

function computeStage(progress: number): 1 | 2 | 3 | 4 {
  if (progress >= 1) return 4
  if (progress >= 0.66) return 3
  if (progress >= 0.33) return 2
  return 1
}
