import type { CropType } from './types'

const PALETTE: Record<
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

export function CropSprite({
  stage,
  cropType,
  pixel = 4,
}: {
  stage: 1 | 2 | 3 | 4
  cropType: CropType
  pixel?: number
}) {
  const palette = PALETTE[cropType]
  const heightPct = { 1: 0.35, 2: 0.6, 3: 0.85, 4: 1 }[stage]
  const fruitVisible = stage === 4
  const fruitSize = cropType === 'pumpkin' ? pixel * 7 : pixel * 5

  return (
    <div className="relative h-full w-full">
      {/* stem */}
      <div
        className="absolute bottom-0"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${pixel * 2}px`,
          height: `${heightPct * 100}%`,
          backgroundColor: palette.stem,
          boxShadow: `inset -1px 0 0 0 #1e3a1e, inset 1px 0 0 0 #4ade80`,
        }}
      />
      {stage >= 2 && (
        <>
          <Leaf
            color={palette.leaf}
            pixel={pixel}
            style={{ left: '12%', bottom: `${heightPct * 30}%`, transform: 'rotate(-30deg)' }}
          />
          <Leaf
            color={palette.leaf}
            pixel={pixel}
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
          pixel={pixel}
          style={{ left: '6%', bottom: `${heightPct * 65}%`, transform: 'rotate(-15deg)' }}
        />
      )}
      {fruitVisible && (
        <div
          className="absolute"
          style={{
            top: `-${pixel * 2}px`,
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

function Leaf({
  color,
  pixel,
  style,
}: {
  color: string
  pixel: number
  style: React.CSSProperties
}) {
  return (
    <div
      className="absolute"
      style={{
        ...style,
        width: `${pixel * 5}px`,
        height: `${pixel * 2.5}px`,
        backgroundColor: color,
        borderRadius: '60% 30% 60% 30%',
        boxShadow: 'inset -1px -1px 0 0 rgba(0,0,0,0.25), inset 1px 1px 0 0 rgba(255,255,255,0.25)',
      }}
    />
  )
}
