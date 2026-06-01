import { Sprout } from 'lucide-react'
import type { Plot, CropType } from './types'

const PIXEL = 4 // each source pixel rendered at 4x
const TILE = 16 // source tile size

interface FarmSceneProps {
  plots: Plot[]
  growDurationSeconds: number
  now: number
  onPlant: (plotId: number) => void
  onHarvest: (plotId: number) => void
  busy: boolean
}

export function FarmScene({
  plots,
  growDurationSeconds,
  now,
  onPlant,
  onHarvest,
  busy,
}: FarmSceneProps) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl border-4 border-[var(--color-gf-navy)] shadow-[0_8px_0_0_var(--color-gf-navy)]"
      style={{ aspectRatio: '5 / 3' }}
    >
      {/* ── SKY (top 35%) ─────────────────────────────── */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: '38%',
          background: 'linear-gradient(to bottom, #aee2ff 0%, #cdedff 60%, #e3f3d0 100%)',
        }}
      />
      {/* clouds */}
      <Cloud style={{ 'left': '10%', 'top': '10%', '--cloud-w': '78px' } as any} delay="0s" />
      <Cloud style={{ 'left': '45%', 'top': '5%', '--cloud-w': '54px' } as any} delay="-7s" />
      <Cloud style={{ 'right': '18%', 'top': '14%', '--cloud-w': '64px' } as any} delay="-14s" />

      {/* sun */}
      <div
        className="pointer-events-none absolute"
        style={{
          right: `${PIXEL * 12}px`,
          top: `${PIXEL * 8}px`,
          width: `${PIXEL * 16}px`,
          height: `${PIXEL * 16}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #fde68a 0%, #fcd34d 55%, transparent 100%)',
          boxShadow: '0 0 32px 8px rgba(252, 211, 77, 0.55)',
          animation: 'fazendinha-sun-pulse 4s ease-in-out infinite',
        }}
      />

      {/* ── GRASS (bottom 65%) ────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: '62%',
          backgroundImage: 'url(/rpg/cute-fantasy/Grass_2_Middle.png)',
          backgroundSize: `${TILE * PIXEL}px ${TILE * PIXEL}px`,
          backgroundRepeat: 'repeat',
          imageRendering: 'pixelated',
        }}
      />
      {/* subtle vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(15,23,42,0.18) 100%)',
        }}
      />

      {/* ── BACKGROUND DECORATION (trees, flowers) ───── */}
      <Tree style={{ left: '3%', bottom: '45%' }} scale={2.6} />
      <Tree style={{ right: '4%', bottom: '52%' }} scale={2.3} flip />
      <Tree style={{ left: '14%', bottom: '35%' }} scale={1.8} />

      <Flower style={{ left: '6%', bottom: '8%' }} hue={350} />
      <Flower style={{ left: '12%', bottom: '4%' }} hue={50} />
      <Flower style={{ left: '24%', bottom: '6%' }} hue={290} />
      <Flower style={{ right: '6%', bottom: '8%' }} hue={20} />
      <Flower style={{ right: '20%', bottom: '4%' }} hue={200} />
      <Flower style={{ right: '34%', bottom: '7%' }} hue={350} />
      <Flower style={{ left: '46%', bottom: '3%' }} hue={50} />

      {/* Wooden fence behind the plots */}
      <FenceRow style={{ left: '8%', right: '8%', top: '42%' }} />

      {/* ── PLOTS GRID ────────────────────────────────── */}
      <div
        className="absolute"
        style={{
          left: '16%',
          top: '46%',
          width: '46%',
          height: '46%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: `${PIXEL * 5}px`,
        }}
      >
        {plots.map((plot) => (
          <PlotTile
            key={plot.id}
            plot={plot}
            growDurationSeconds={growDurationSeconds}
            now={now}
            onPlant={() => onPlant(plot.id)}
            onHarvest={() => onHarvest(plot.id)}
            busy={busy}
          />
        ))}
      </div>

      {/* ── CHARACTERS / CRITTERS ─────────────────────── */}
      {/* Player: Farmer Bob, idle on the right of the plots */}
      <div
        className="pointer-events-none absolute"
        style={{ right: '12%', top: '55%', filter: 'drop-shadow(2px 4px 0 rgba(15,23,42,0.3))' }}
      >
        <div className="idle-character-sprite idle-character-sprite--idle" />
        {/* tiny ground shadow ellipse */}
        <div
          className="absolute"
          style={{
            left: '50%',
            bottom: '-6px',
            transform: 'translateX(-50%)',
            width: 70,
            height: 8,
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.18)',
            filter: 'blur(3px)',
          }}
        />
      </div>

      {/* Butterfly flying around */}
      <Butterfly style={{ left: '8%', top: '38%' }} delay="0s" />
      <Butterfly style={{ right: '24%', top: '32%' }} delay="-3s" />

      {/* Bee buzzing */}
      <Bee style={{ left: '32%', top: '28%' }} delay="-2s" />

      <style>{`
        @keyframes fazendinha-sun-pulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.05); filter: brightness(1.1); }
        }
        @keyframes fazendinha-cloud-drift {
          from { transform: translateX(0); }
          to { transform: translateX(80px); }
        }
        @keyframes fazendinha-butterfly-anim {
          from { background-position: 0 0; }
          to { background-position: 0 -${64 * PIXEL}px; }
        }
        @keyframes fazendinha-butterfly-float {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(20px, -12px); }
          50%  { transform: translate(40px, 6px); }
          75%  { transform: translate(18px, -18px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes fazendinha-bee-anim {
          from { background-position: 0 0; }
          to { background-position: -${64 * PIXEL}px 0; }
        }
        @keyframes fazendinha-bee-buzz {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(14px, -8px); }
          50% { transform: translate(28px, 4px); }
          75% { transform: translate(8px, -14px); }
        }
        @keyframes fazendinha-flower-sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes fazendinha-plot-ready-pulse {
          0%, 100% { transform: translateY(0) scale(1); filter: brightness(1); }
          50% { transform: translateY(-2px) scale(1.04); filter: brightness(1.12); }
        }
        @keyframes fazendinha-sparkle-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fazendinha-grow-bounce {
          0% { transform: translateY(8px) scale(0.85); opacity: 0; }
          60% { transform: translateY(-2px) scale(1.05); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

/* ──────────────────────────────────────────────────────
 * Decorative elements
 * ──────────────────────────────────────────────────── */

function Cloud({ style, delay }: { style: React.CSSProperties; delay: string }) {
  return (
    <div
      className="pointer-events-none absolute opacity-90"
      style={{
        ...style,
        height: 'calc(var(--cloud-w) * 0.45)',
        width: 'var(--cloud-w)',
        animation: 'fazendinha-cloud-drift 22s ease-in-out infinite alternate',
        animationDelay: delay,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: '#ffffff',
          borderRadius: '999px',
          boxShadow: 'inset 0 -3px 0 0 #c9def2, 0 2px 0 0 rgba(15, 23, 42, 0.08)',
        }}
      />
      <div
        className="absolute"
        style={{
          width: '46%',
          height: '70%',
          background: '#ffffff',
          borderRadius: '999px',
          top: '-30%',
          left: '20%',
          boxShadow: 'inset 0 -3px 0 0 #c9def2',
        }}
      />
      <div
        className="absolute"
        style={{
          width: '34%',
          height: '50%',
          background: '#ffffff',
          borderRadius: '999px',
          top: '-15%',
          right: '8%',
          boxShadow: 'inset 0 -3px 0 0 #c9def2',
        }}
      />
    </div>
  )
}

function Tree({
  style,
  scale = 2,
  flip = false,
}: {
  style: React.CSSProperties
  scale?: number
  flip?: boolean
}) {
  // tree_fruit.png is 96x64 — the rightmost ~32x64 region is a full medium tree
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        ...style,
        width: `${32 * scale}px`,
        height: `${64 * scale}px`,
        backgroundImage: 'url(/images/farm/tree_fruit.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: `-${32 * scale}px 0`,
        backgroundSize: `${96 * scale}px ${64 * scale}px`,
        imageRendering: 'pixelated',
        transform: `translateY(50%) ${flip ? 'scaleX(-1)' : ''}`,
        filter: 'drop-shadow(2px 4px 0 rgba(15, 23, 42, 0.18))',
      }}
    />
  )
}

function Flower({ style, hue }: { style: React.CSSProperties; hue: number }) {
  // chunky CSS pixel flower: 3 petals + center + stem with two leaves
  const petal = `hsl(${hue} 85% 65%)`
  const petalDark = `hsl(${hue} 75% 45%)`
  const center = `hsl(50 90% 60%)`
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        ...style,
        width: `${PIXEL * 6}px`,
        height: `${PIXEL * 9}px`,
        transformOrigin: 'bottom center',
        animation: 'fazendinha-flower-sway 3.5s ease-in-out infinite',
        animationDelay: `${hue * 0.01}s`,
      }}
    >
      {/* stem */}
      <div
        className="absolute"
        style={{
          left: '50%',
          bottom: 0,
          transform: 'translateX(-50%)',
          width: `${PIXEL}px`,
          height: `${PIXEL * 5}px`,
          backgroundColor: '#2f7a3a',
          boxShadow: 'inset -1px 0 0 0 #1f5728, inset 1px 0 0 0 #4ade80',
        }}
      />
      {/* leaf */}
      <div
        className="absolute"
        style={{
          left: '5%',
          bottom: `${PIXEL * 2}px`,
          width: `${PIXEL * 2.5}px`,
          height: `${PIXEL * 1.5}px`,
          backgroundColor: '#4ade80',
          borderRadius: '60% 30% 60% 30%',
          transform: 'rotate(-20deg)',
        }}
      />
      {/* petals: 4 around + center */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
          width: `${PIXEL * 6}px`,
          height: `${PIXEL * 5}px`,
          filter: 'drop-shadow(1px 1px 0 rgba(15,23,42,0.25))',
        }}
      >
        {/* top petal */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: 0,
            transform: 'translateX(-50%)',
            width: `${PIXEL * 2}px`,
            height: `${PIXEL * 2}px`,
            backgroundColor: petal,
            borderRadius: '50%',
            boxShadow: `inset -1px -1px 0 0 ${petalDark}`,
          }}
        />
        {/* left petal */}
        <div
          className="absolute"
          style={{
            left: 0,
            top: `${PIXEL * 1.5}px`,
            width: `${PIXEL * 2}px`,
            height: `${PIXEL * 2}px`,
            backgroundColor: petal,
            borderRadius: '50%',
            boxShadow: `inset -1px -1px 0 0 ${petalDark}`,
          }}
        />
        {/* right petal */}
        <div
          className="absolute"
          style={{
            right: 0,
            top: `${PIXEL * 1.5}px`,
            width: `${PIXEL * 2}px`,
            height: `${PIXEL * 2}px`,
            backgroundColor: petal,
            borderRadius: '50%',
            boxShadow: `inset -1px -1px 0 0 ${petalDark}`,
          }}
        />
        {/* bottom petal */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: `${PIXEL * 3}px`,
            transform: 'translateX(-50%)',
            width: `${PIXEL * 2}px`,
            height: `${PIXEL * 2}px`,
            backgroundColor: petal,
            borderRadius: '50%',
            boxShadow: `inset -1px -1px 0 0 ${petalDark}`,
          }}
        />
        {/* yellow center */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: `${PIXEL * 1.7}px`,
            transform: 'translateX(-50%)',
            width: `${PIXEL * 1.5}px`,
            height: `${PIXEL * 1.5}px`,
            backgroundColor: center,
            borderRadius: '50%',
            boxShadow: 'inset -1px -1px 0 0 #b45309',
          }}
        />
      </div>
    </div>
  )
}

function FenceRow({ style }: { style: React.CSSProperties }) {
  // fences.png is 64x64 — use the top-middle horizontal post region (row 0).
  const SCALE = 2.5
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        ...style,
        height: `${16 * SCALE}px`,
        backgroundImage: 'url(/images/farm/fences.png)',
        backgroundRepeat: 'repeat-x',
        backgroundSize: `${64 * SCALE}px ${64 * SCALE}px`,
        backgroundPosition: '0 0',
        imageRendering: 'pixelated',
        opacity: 0.9,
      }}
    />
  )
}

function Butterfly({ style, delay }: { style: React.CSSProperties; delay: string }) {
  // butterfly.png is 16x64 = 4 vertical frames of 16x16
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        ...style,
        width: `${16 * PIXEL}px`,
        height: `${16 * PIXEL}px`,
        animation: 'fazendinha-butterfly-float 8s ease-in-out infinite',
        animationDelay: delay,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/images/farm/butterfly.png)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${16 * PIXEL}px ${64 * PIXEL}px`,
          backgroundPosition: '0 0',
          animation: 'fazendinha-butterfly-anim 0.45s steps(4) infinite',
          imageRendering: 'pixelated',
          filter: 'drop-shadow(1px 2px 0 rgba(15, 23, 42, 0.25))',
        }}
      />
    </div>
  )
}

function Bee({ style, delay }: { style: React.CSSProperties; delay: string }) {
  // bee.png is 64x32 = 4 horizontal frames of 16x32
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        ...style,
        width: `${16 * PIXEL}px`,
        height: `${32 * PIXEL}px`,
        animation: 'fazendinha-bee-buzz 6s ease-in-out infinite',
        animationDelay: delay,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/images/farm/bee.png)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${64 * PIXEL}px ${32 * PIXEL}px`,
          backgroundPosition: '0 0',
          animation: 'fazendinha-bee-anim 0.35s steps(4) infinite',
          imageRendering: 'pixelated',
          filter: 'drop-shadow(1px 2px 0 rgba(15, 23, 42, 0.25))',
        }}
      />
    </div>
  )
}

/* ──────────────────────────────────────────────────────
 * Plot tile
 * ──────────────────────────────────────────────────── */

function PlotTile({
  plot,
  growDurationSeconds,
  now,
  onPlant,
  onHarvest,
  busy,
}: {
  plot: Plot
  growDurationSeconds: number
  now: number
  onPlant: () => void
  onHarvest: () => void
  busy: boolean
}) {
  const progress = computeProgress(plot, growDurationSeconds, now)
  const stage = computeStage(progress)
  const isReady = plot.state === 'ready'
  const isEmpty = plot.state === 'empty'

  return (
    <button
      type="button"
      onClick={isReady ? onHarvest : isEmpty ? onPlant : undefined}
      disabled={busy || (!isReady && !isEmpty)}
      className="group relative flex items-end justify-center overflow-hidden rounded-md outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-white disabled:cursor-default disabled:hover:translate-y-0"
      style={{
        background: 'linear-gradient(180deg, #a36138 0%, #8b5128 60%, #6e3f1f 100%)',
        boxShadow:
          'inset 0 2px 0 0 #c98456, inset 0 -3px 0 0 #5c3219, inset 3px 0 0 0 #5c3219, inset -3px 0 0 0 #5c3219, 0 3px 0 0 rgba(15,23,42,0.3)',
        cursor: isReady || isEmpty ? 'pointer' : 'default',
      }}
      aria-label={
        isReady ? 'Colher esse canteiro' : isEmpty ? 'Plantar nesse canteiro' : 'Aguardando crescer'
      }
    >
      {/* soil texture: dotted darker spots */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(60, 30, 12, 0.6) 1px, transparent 1.5px)',
          backgroundSize: '8px 8px',
        }}
      />
      {/* furrow lines */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, transparent 0, transparent 12px, rgba(60, 30, 12, 0.18) 12px, rgba(60, 30, 12, 0.18) 14px)',
        }}
      />

      {/* the crop */}
      {!isEmpty && (
        <div
          className="relative z-10 flex items-end justify-center pb-1"
          style={{
            width: '70%',
            height: '95%',
            animation: isReady
              ? 'fazendinha-plot-ready-pulse 1.2s ease-in-out infinite'
              : undefined,
          }}
        >
          <CropSprite stage={stage} cropType={plot.cropType ?? 'carrot'} />
        </div>
      )}

      {/* hint when empty: shovel + Plantar label */}
      {isEmpty && (
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-95 group-focus-visible:opacity-95"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <div className="rounded-full bg-white/95 p-2 ring-2 ring-[var(--color-gf-navy)] shadow">
            <Sprout className="h-5 w-5 text-[var(--color-gf-primary)]" strokeWidth={2.75} />
          </div>
          <span className="rounded-md bg-[var(--color-gf-navy)] px-1.5 py-0.5 text-[10px] font-bold text-white">
            Plantar
          </span>
        </div>
      )}

      {/* sparkle when ready */}
      {isReady && (
        <div
          className="pointer-events-none absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-gf-gold)] text-base ring-2 ring-[var(--color-gf-navy)] shadow-[0_2px_0_0_var(--color-gf-navy)]"
          style={{ animation: 'fazendinha-sparkle-spin 4s linear infinite' }}
        >
          <span style={{ filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.3))' }}>✨</span>
        </div>
      )}

      {/* growing progress bar */}
      {plot.state === 'growing' && (
        <div
          className="pointer-events-none absolute bottom-1 left-1 right-1 mx-auto flex items-center"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <div className="flex w-full items-center gap-1 rounded-full bg-black/65 px-1.5 py-0.5 text-[10px] font-bold text-white">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full bg-[var(--color-gf-gold)] transition-[width] duration-500"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <span className="tabular-nums">{formatRemaining(plot, growDurationSeconds, now)}</span>
          </div>
        </div>
      )}
    </button>
  )
}

type Stage = 1 | 2 | 3 | 4

function computeProgress(plot: Plot, growDurationSeconds: number, now: number): number {
  if (plot.state === 'ready') return 1
  if (plot.state !== 'growing' || !plot.plantedAt) return 0
  const elapsed = (now - new Date(plot.plantedAt).getTime()) / 1000
  return Math.max(0, Math.min(1, elapsed / growDurationSeconds))
}

function computeStage(progress: number): Stage {
  if (progress >= 1) return 4
  if (progress >= 0.66) return 3
  if (progress >= 0.33) return 2
  return 1
}

function formatRemaining(plot: Plot, growDurationSeconds: number, now: number): string {
  if (!plot.plantedAt) return ''
  const elapsed = (now - new Date(plot.plantedAt).getTime()) / 1000
  const remaining = Math.max(0, Math.ceil(growDurationSeconds - elapsed))
  if (remaining >= 60) return `${Math.ceil(remaining / 60)}m`
  return `${remaining}s`
}

/* ──────────────────────────────────────────────────────
 * Crop sprite — pixel-art per crop type with leaves+fruit
 * ──────────────────────────────────────────────────── */

const CROP_PALETTE: Record<
  CropType,
  { fruit: string; fruitShadow: string; fruitHighlight: string; leaf: string; stem: string }
> = {
  carrot: {
    fruit: '#f97316',
    fruitShadow: '#9a3412',
    fruitHighlight: '#fed7aa',
    leaf: '#16a34a',
    stem: '#15803d',
  },
  tomato: {
    fruit: '#ef4444',
    fruitShadow: '#7f1d1d',
    fruitHighlight: '#fecaca',
    leaf: '#22c55e',
    stem: '#15803d',
  },
  corn: {
    fruit: '#facc15',
    fruitShadow: '#a16207',
    fruitHighlight: '#fef9c3',
    leaf: '#84cc16',
    stem: '#4d7c0f',
  },
  pumpkin: {
    fruit: '#fb923c',
    fruitShadow: '#9a3412',
    fruitHighlight: '#ffedd5',
    leaf: '#15803d',
    stem: '#365314',
  },
  eggplant: {
    fruit: '#7c3aed',
    fruitShadow: '#3b0764',
    fruitHighlight: '#d8b4fe',
    leaf: '#22c55e',
    stem: '#15803d',
  },
}

function CropSprite({ stage, cropType }: { stage: Stage; cropType: CropType }) {
  const palette = CROP_PALETTE[cropType]
  const heightPct = { 1: 0.35, 2: 0.6, 3: 0.85, 4: 1 }[stage]
  const fruitVisible = stage === 4
  const fruitSize = cropType === 'pumpkin' ? PIXEL * 7 : PIXEL * 5

  return (
    <div
      key={stage}
      className="relative flex items-end justify-center"
      style={{
        width: '80%',
        height: '100%',
        animation: 'fazendinha-grow-bounce 0.5s ease-out',
      }}
    >
      {/* stem */}
      <div
        className="absolute bottom-0"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${PIXEL * 2}px`,
          height: `${heightPct * 100}%`,
          backgroundColor: palette.stem,
          boxShadow: `inset -1px 0 0 0 #1e3a1e, inset 1px 0 0 0 #4ade80`,
        }}
      />
      {/* leaves */}
      {stage >= 2 && (
        <>
          <Leaf
            color={palette.leaf}
            style={{ left: '12%', bottom: `${heightPct * 30}%`, transform: 'rotate(-30deg)' }}
          />
          <Leaf
            color={palette.leaf}
            style={{
              right: '12%',
              bottom: `${heightPct * 50}%`,
              transform: 'rotate(30deg) scaleX(-1)',
            }}
          />
        </>
      )}
      {stage >= 3 && (
        <Leaf
          color={palette.leaf}
          style={{ left: '6%', bottom: `${heightPct * 65}%`, transform: 'rotate(-15deg)' }}
        />
      )}
      {/* fruit on top */}
      {fruitVisible && (
        <div
          className="absolute"
          style={{
            top: `-${PIXEL * 2}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${fruitSize}px`,
            height: `${fruitSize}px`,
            backgroundColor: palette.fruit,
            borderRadius: cropType === 'corn' ? '35% 35% 50% 50%' : '45%',
            boxShadow: `inset -2px -3px 0 0 ${palette.fruitShadow}, inset 2px 2px 0 0 ${palette.fruitHighlight}, 0 2px 0 0 rgba(15,23,42,0.3)`,
          }}
        />
      )}
    </div>
  )
}

function Leaf({ color, style }: { color: string; style: React.CSSProperties }) {
  return (
    <div
      className="absolute"
      style={{
        ...style,
        width: `${PIXEL * 5}px`,
        height: `${PIXEL * 2.5}px`,
        backgroundColor: color,
        borderRadius: '60% 30% 60% 30%',
        boxShadow: 'inset -1px -1px 0 0 rgba(0,0,0,0.25), inset 1px 1px 0 0 rgba(255,255,255,0.25)',
      }}
    />
  )
}
