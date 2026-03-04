const GRASS_TUFTS = [
  { x: 95, y: 110, scale: 1 },
  { x: 310, y: 130, scale: 0.8 },
  { x: 130, y: 210, scale: 0.9 },
  { x: 280, y: 200, scale: 1.1 },
  { x: 100, y: 160, scale: 0.7 },
  { x: 320, y: 170, scale: 0.85 },
]

const FLOWERS = [
  { x: 110, y: 130, color: '#FCD34D' },
  { x: 300, y: 150, color: '#F97066' },
  { x: 140, y: 220, color: '#8B5CF6' },
  { x: 290, y: 210, color: '#FCD34D' },
]

const PEBBLES = [
  { x: 160, y: 230, rx: 5, ry: 3 },
  { x: 270, y: 100, rx: 4, ry: 2.5 },
  { x: 240, y: 225, rx: 3, ry: 2 },
]

const STARS_DARK = [
  { x: 30, y: 20, r: 1.2 },
  { x: 370, y: 30, r: 1 },
  { x: 50, y: 60, r: 0.8 },
  { x: 350, y: 70, r: 1.1 },
  { x: 20, y: 250, r: 0.9 },
  { x: 380, y: 240, r: 1 },
  { x: 180, y: 15, r: 0.7 },
  { x: 300, y: 260, r: 0.8 },
]

export function IslandDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 3 }}>
      <svg
        className="h-full w-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grass tufts */}
        {GRASS_TUFTS.map((g, i) => (
          <g
            key={`grass-${i}`}
            transform={`translate(${g.x}, ${g.y}) scale(${g.scale})`}
            className="animate-[gf-sway_3s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 0.4}s` }}
          >
            <line x1="0" y1="0" x2="-3" y2="-10" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
            <line x1="0" y1="0" x2="0" y2="-12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            <line x1="0" y1="0" x2="3" y2="-9" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
          </g>
        ))}

        {/* Flowers */}
        {FLOWERS.map((f, i) => (
          <g key={`flower-${i}`} transform={`translate(${f.x}, ${f.y})`}>
            <line x1="0" y1="0" x2="0" y2="-8" stroke="#059669" strokeWidth="1.5" />
            <circle cx="0" cy="-10" r="3" fill={f.color} />
            <circle cx="0" cy="-10" r="1.5" fill="white" opacity="0.6" />
          </g>
        ))}

        {/* Pebbles */}
        {PEBBLES.map((p, i) => (
          <ellipse
            key={`pebble-${i}`}
            cx={p.x}
            cy={p.y}
            rx={p.rx}
            ry={p.ry}
            className="fill-stone-400/40 dark:fill-stone-600/30"
          />
        ))}

        {/* Dark mode: stars */}
        {STARS_DARK.map((s, i) => (
          <circle
            key={`star-${i}`}
            cx={s.x}
            cy={s.y}
            r={s.r}
            className="hidden fill-white dark:block animate-[gf-twinkle_2s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </svg>
    </div>
  )
}
