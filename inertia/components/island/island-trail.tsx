import { motion } from 'framer-motion'
import { trailDraw } from '../../lib/gamified-animations'

interface IslandTrailProps {
  progress: number // 0-100
  level: number
}

export function IslandTrail({ progress, level }: IslandTrailProps) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100) / 100

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 5 }}>
      <svg
        className="h-full w-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="trail-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Trail background (unfilled path) */}
        <path
          d="M110 200 C130 180, 140 160, 160 155 C180 150, 200 165, 220 155 C240 145, 250 130, 280 135"
          fill="none"
          stroke="#D4A574"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.3"
          strokeDasharray="4 6"
        />

        {/* Trail filled (progress) */}
        <motion.path
          d="M110 200 C130 180, 140 160, 160 155 C180 150, 200 165, 220 155 C240 145, 250 130, 280 135"
          fill="none"
          stroke="url(#trail-gradient)"
          strokeWidth="6"
          strokeLinecap="round"
          variants={trailDraw}
          custom={normalizedProgress}
          className="drop-shadow-[0_0_4px_rgba(252,211,77,0.4)]"
        />

        {/* Start marker */}
        <circle cx="110" cy="200" r="6" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2" />
        <text x="110" y="218" textAnchor="middle" className="fill-gf-gold-dark font-display text-[9px] font-bold">
          Nv.{level}
        </text>

        {/* End marker */}
        <circle cx="280" cy="135" r="6" fill="#D4A574" stroke="#8B5E3C" strokeWidth="2" opacity="0.5" />
        <text x="280" y="125" textAnchor="middle" className="fill-gf-secondary font-display text-[9px] font-bold" opacity="0.5">
          Nv.{level + 1}
        </text>
      </svg>
    </div>
  )
}
