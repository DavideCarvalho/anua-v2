import { Coins, Star, Flame } from 'lucide-react'
import { useCountUp } from '../../lib/use-count-up'

export interface RpgHudProps {
  points: number
  level: number
  streak: number
}

/**
 * Wooden-sign-style HUD overlay positioned at the top centre of the RPG canvas.
 * Mirrors the original IslandStatsSign design.
 */
export function RpgHud({ points, level, streak }: RpgHudProps) {
  const animatedPoints = useCountUp(points)
  const animatedLevel = useCountUp(level, 400)
  const animatedStreak = useCountUp(streak, 400)

  return (
    <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '3%', zIndex: 30 }}>
      <div className="relative">
        {/* Sign post */}
        <div className="absolute left-1/2 top-full h-4 w-2 -translate-x-1/2 rounded-b bg-[#8B5E3C] dark:bg-[#6B3F1F]" />

        {/* Wooden sign board */}
        <div className="flex items-center gap-2 rounded-lg border-2 border-[#8B5E3C] bg-[#DEB887] px-3 py-1.5 shadow-[2px_2px_0px_#6B3F1F] dark:border-[#6B3F1F] dark:bg-[#8B5E3C] sm:gap-3 sm:px-4 sm:py-2">
          {/* Points */}
          <div className="flex items-center gap-1">
            <Coins className="size-3.5 text-gf-gold-dark sm:size-4" />
            <span className="font-display text-xs font-bold text-gf-gold-dark sm:text-sm">
              {animatedPoints}
            </span>
          </div>

          <div className="h-4 w-px bg-[#8B5E3C]/30 dark:bg-white/20" />

          {/* Level */}
          <div className="flex items-center gap-1">
            <Star className="size-3.5 fill-gf-primary text-gf-primary sm:size-4" />
            <span className="font-display text-xs font-bold text-gf-primary-dark dark:text-gf-primary-light sm:text-sm">
              {animatedLevel}
            </span>
          </div>

          {streak > 0 && (
            <>
              <div className="h-4 w-px bg-[#8B5E3C]/30 dark:bg-white/20" />
              <div className="flex items-center gap-1">
                <Flame className="size-3.5 text-gf-accent sm:size-4" />
                <span className="font-display text-xs font-bold text-gf-accent sm:text-sm">
                  {animatedStreak}d
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
