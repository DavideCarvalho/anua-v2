import { cn } from '../../lib/utils'

export interface AvatarComposedProps {
  skinTone?: string
  hairStyle?: string
  hairColor?: string
  outfit?: string
  accessories?: string[]
  className?: string
  /** Compact variant for headers - smaller, no background */
  variant?: 'default' | 'compact'
}

const SKIN_COLORS: Record<string, string> = {
  light: '#f5d0c5',
  medium: '#d4a574',
  dark: '#8d5524',
  default: '#d4a574',
}

const HAIR_COLORS: Record<string, string> = {
  black: '#1a1a1a',
  brown: '#5c4033',
  blonde: '#f5deb3',
  red: '#a52a2a',
  default: '#5c4033',
}

const OUTFIT_COLORS: Record<string, string> = {
  default: '#4a90d9',
  blue: '#4a90d9',
  green: '#48bb78',
  red: '#e53e3e',
  purple: '#805ad5',
  orange: '#ed8936',
  yellow: '#ecc94b',
}

function getOutfitColor(outfitId: string): string {
  const key = outfitId?.toLowerCase() ?? 'default'
  return OUTFIT_COLORS[key] ?? OUTFIT_COLORS.default
}

function HairShort({ color }: { color: string }) {
  return <ellipse cx="0" cy="-5" rx="22" ry="10" fill={color} />
}

function HairLong({ color }: { color: string }) {
  return (
    <>
      <ellipse cx="0" cy="-8" rx="24" ry="11" fill={color} />
      <path
        d="M -22 -5 Q -24 12 -20 28 Q -16 24 -12 22 L 0 18 L 12 22 Q 16 24 20 28 Q 24 12 22 -5 Z"
        fill={color}
      />
    </>
  )
}

function HairCurly({ color }: { color: string }) {
  return (
    <>
      <ellipse cx="0" cy="-8" rx="26" ry="12" fill={color} />
      <circle cx="-12" cy="0" r="6" fill={color} />
      <circle cx="0" cy="-2" r="7" fill={color} />
      <circle cx="12" cy="0" r="6" fill={color} />
      <circle cx="-8" cy="8" r="5" fill={color} />
      <circle cx="8" cy="8" r="5" fill={color} />
    </>
  )
}

function HairDefault({ color }: { color: string }) {
  return (
    <path
      d="M -18 -2 Q -22 -10 -12 -14 Q 0 -18 12 -14 Q 22 -10 18 -2 Q 16 6 0 4 Q -16 6 -18 -2 Z"
      fill={color}
    />
  )
}

function HairPiece({ style, color }: { style: string; color: string }) {
  switch (style) {
    case 'short':
      return <HairShort color={color} />
    case 'long':
      return <HairLong color={color} />
    case 'curly':
      return <HairCurly color={color} />
    default:
      return <HairDefault color={color} />
  }
}

export function AvatarComposed({
  skinTone = 'medium',
  hairStyle = 'default',
  hairColor = 'brown',
  outfit = 'default',
  accessories,
  className,
  variant = 'default',
}: AvatarComposedProps) {
  const accessoriesList = Array.isArray(accessories) ? accessories : []
  const skinHex = SKIN_COLORS[skinTone ?? 'medium'] ?? SKIN_COLORS.medium
  const hairHex = HAIR_COLORS[hairColor ?? 'brown'] ?? HAIR_COLORS.brown
  const outfitHex = getOutfitColor(outfit)
  const isCompact = variant === 'compact'

  return (
    <div
      className={cn(
        'flex aspect-square w-full items-center justify-center',
        !isCompact &&
          'max-w-[280px] rounded-xl bg-gradient-to-b from-amber-100 to-orange-200 dark:from-amber-950/50 dark:to-orange-900/30 p-4',
        isCompact && 'size-full max-w-[48px] max-h-[48px] min-w-0 min-h-0',
        className
      )}
    >
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full max-h-[200px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(50, 55)">
          {/* Body/outfit - layer 1 (shirt shape) */}
          <path
            d="M -16 -8 L -18 22 L -10 38 L 10 38 L 18 22 L 16 -8 L 12 -12 L -12 -12 Z"
            fill={outfitHex}
            stroke="#2c5282"
            strokeWidth="1"
          />

          {/* Legs */}
          <rect x="-12" y="38" width="8" height="22" rx="2" fill="#2c5282" />
          <rect x="4" y="38" width="8" height="22" rx="2" fill="#2c5282" />

          {/* Head - layer 2 */}
          <circle cx="0" cy="-22" r="18" fill={skinHex} stroke="#c4a574" strokeWidth="1" />

          {/* Hair - layer 3 (on top of head) */}
          <g transform="translate(0, -22)">
            <HairPiece style={hairStyle} color={hairHex} />
          </g>

          {/* Face - eyes */}
          <ellipse cx="-5" cy="-24" rx="2.5" ry="3" fill="#1a1a1a" />
          <ellipse cx="5" cy="-24" rx="2.5" ry="3" fill="#1a1a1a" />
          <ellipse cx="-5" cy="-23" rx="0.8" ry="1" fill="white" />
          <ellipse cx="5" cy="-23" rx="0.8" ry="1" fill="white" />
          {/* Smile */}
          <path
            d="M -4 -19 Q 0 -16 4 -19"
            stroke="#5c4033"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />

          {/* Accessories - layer 4 (around head) */}
          {accessoriesList.slice(0, 3).map((_, i) => {
            const angle = (i - 1) * 45
            const x = Math.sin((angle * Math.PI) / 180) * 22
            const y = -22 + Math.cos((angle * Math.PI) / 180) * 22
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3.5"
                fill="#ecc94b"
                stroke="#d69e2e"
                strokeWidth="1"
              />
            )
          })}
        </g>
      </svg>
    </div>
  )
}
