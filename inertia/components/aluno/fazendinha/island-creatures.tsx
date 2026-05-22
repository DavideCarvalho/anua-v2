import { useEffect, useState } from 'react'

const PIXEL = 3

interface AnimatedSpriteProps {
  src: string
  frameW: number
  frameH: number
  sheetW: number
  sheetH: number
  framesPerRow: number
  frameCount: number
  durationMs: number
  scale?: number
  row?: number
  style?: React.CSSProperties
  flip?: boolean
}

export function AnimatedSprite({
  src,
  frameW,
  frameH,
  sheetW,
  sheetH,
  framesPerRow,
  frameCount,
  durationMs,
  scale = PIXEL,
  row = 0,
  style,
  flip = false,
}: AnimatedSpriteProps) {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const t = window.setInterval(() => {
      setFrame((f) => (f + 1) % frameCount)
    }, durationMs / frameCount)
    return () => window.clearInterval(t)
  }, [durationMs, frameCount])

  const col = frame % framesPerRow
  const rowOffset = row + Math.floor(frame / framesPerRow)
  return (
    <div
      style={{
        width: frameW * scale,
        height: frameH * scale,
        backgroundImage: `url(${src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${sheetW * scale}px ${sheetH * scale}px`,
        backgroundPosition: `-${col * frameW * scale}px -${rowOffset * frameH * scale}px`,
        imageRendering: 'pixelated',
        transform: flip ? 'scaleX(-1)' : undefined,
        filter: 'drop-shadow(2px 4px 0 rgba(15,23,42,0.3))',
        ...style,
      }}
    />
  )
}

/* -------- Specific creatures -------- */

export function Slime({
  color = 'green',
  style,
}: {
  color?: 'green' | 'blue' | 'pink'
  style?: React.CSSProperties
}) {
  // Slime_Small is 128x64 = 8 frames of 16x16, idle hop loop
  return (
    <div className="pointer-events-none absolute" style={style}>
      <AnimatedSprite
        src={`/images/farm/slime_${color}.png`}
        frameW={16}
        frameH={16}
        sheetW={128}
        sheetH={64}
        framesPerRow={8}
        frameCount={8}
        durationMs={900}
      />
    </div>
  )
}

export function Chicken({ style, flip = false }: { style?: React.CSSProperties; flip?: boolean }) {
  // Chicken_01.png is 256x512 = 8 cols × 16 rows of 32x32. Row 0 = idle (2 frames typically)
  return (
    <div className="pointer-events-none absolute" style={style}>
      <AnimatedSprite
        src="/images/farm/chicken.png"
        frameW={32}
        frameH={32}
        sheetW={256}
        sheetH={512}
        framesPerRow={8}
        frameCount={4}
        durationMs={800}
        row={0}
        scale={2}
        flip={flip}
      />
    </div>
  )
}

export function Cow({ style }: { style?: React.CSSProperties }) {
  // Cow_01.png is 256x480 = 8 cols × 15 rows of 32x32. Row ~3 has full standing cow.
  return (
    <div className="pointer-events-none absolute" style={style}>
      <AnimatedSprite
        src="/images/farm/cow.png"
        frameW={32}
        frameH={32}
        sheetW={256}
        sheetH={480}
        framesPerRow={8}
        frameCount={4}
        durationMs={1200}
        row={3}
        scale={2.5}
      />
    </div>
  )
}

export function Frog({ style }: { style?: React.CSSProperties }) {
  // Frog_01.png 320x128 = 10 col × 4 rows of 32x32
  return (
    <div className="pointer-events-none absolute" style={style}>
      <AnimatedSprite
        src="/images/farm/frog.png"
        frameW={32}
        frameH={32}
        sheetW={320}
        sheetH={128}
        framesPerRow={10}
        frameCount={4}
        durationMs={1000}
        row={0}
        scale={2}
      />
    </div>
  )
}

export function Butterfly({ style }: { style?: React.CSSProperties }) {
  // 16x64 sheet, 4 vertical frames of 16x16
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        animation: 'fazendinha-butterfly-float 8s ease-in-out infinite',
        ...style,
      }}
    >
      <AnimatedSprite
        src="/images/farm/butterfly.png"
        frameW={16}
        frameH={16}
        sheetW={16}
        sheetH={64}
        framesPerRow={1}
        frameCount={4}
        durationMs={450}
        scale={2.5}
      />
    </div>
  )
}

export function Bee({ style }: { style?: React.CSSProperties }) {
  // 64x32 sheet, 4 horizontal frames of 16x32
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        animation: 'fazendinha-bee-buzz 6s ease-in-out infinite',
        ...style,
      }}
    >
      <AnimatedSprite
        src="/images/farm/bee.png"
        frameW={16}
        frameH={32}
        sheetW={64}
        sheetH={32}
        framesPerRow={4}
        frameCount={4}
        durationMs={350}
        scale={2.5}
      />
    </div>
  )
}

export function Beehive({ style }: { style?: React.CSSProperties }) {
  // Static; just a single PNG
  return (
    <img
      src="/images/farm/beehive.png"
      alt=""
      className="pointer-events-none absolute"
      style={{
        imageRendering: 'pixelated',
        width: 32 * 2.5,
        filter: 'drop-shadow(2px 4px 0 rgba(15,23,42,0.3))',
        ...style,
      }}
    />
  )
}
