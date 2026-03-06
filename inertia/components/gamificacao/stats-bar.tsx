import { Coins, Star, Flame } from 'lucide-react'
import { useCountUp } from '../../lib/use-count-up'

interface StatsBarProps {
  points: number
  level: number
  streak: number
}

export function StatsBar({ points, level, streak }: StatsBarProps) {
  const animatedPoints = useCountUp(points)
  const animatedLevel = useCountUp(level, 400)
  const animatedStreak = useCountUp(streak, 400)

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5">
      <div className="flex items-center gap-1.5 rounded-full bg-gf-gold/20 px-3 py-1.5 dark:bg-gf-gold-dark/20">
        <Coins className="size-4 text-gf-gold-dark" />
        <span className="font-display text-sm font-bold text-gf-gold-dark">{animatedPoints}</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-gf-primary/10 px-3 py-1.5 dark:bg-gf-primary/20">
        <Star className="size-4 fill-gf-primary text-gf-primary" />
        <span className="font-display text-sm font-bold text-gf-primary">Nv. {animatedLevel}</span>
      </div>
      {streak > 0 && (
        <div className="flex items-center gap-1.5 rounded-full bg-gf-accent/10 px-3 py-1.5 dark:bg-gf-accent/20">
          <Flame className="size-4 text-gf-accent" />
          <span className="font-display text-sm font-bold text-gf-accent">{animatedStreak}d</span>
        </div>
      )}
    </div>
  )
}
