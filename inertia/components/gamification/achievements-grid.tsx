import { Card, CardContent } from '~/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import { Lock, Star, Trophy, Medal, Crown } from 'lucide-react'
import { cn } from '~/lib/utils'

type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

interface Achievement {
  id: string
  name: string
  description: string
  icon?: string
  points: number
  category: string
  rarity: Rarity
  isSecret: boolean
  unlockedAt?: string
  progress?: number
}

interface AchievementsGridProps {
  achievements: Achievement[]
  className?: string
}

const rarityIcons = {
  COMMON: Star,
  RARE: Medal,
  EPIC: Trophy,
  LEGENDARY: Crown,
}

const rarityColors = {
  COMMON: 'text-gray-500 border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600',
  RARE: 'text-blue-500 border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600',
  EPIC: 'text-purple-500 border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-600',
  LEGENDARY:
    'text-yellow-500 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600',
}

export function AchievementsGrid({ achievements, className }: AchievementsGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4',
        className
      )}
    >
      <TooltipProvider>
        {achievements.map((achievement) => {
          const isUnlocked = !!achievement.unlockedAt
          const Icon = isUnlocked ? rarityIcons[achievement.rarity] : Lock
          const colorClass = isUnlocked
            ? rarityColors[achievement.rarity]
            : 'text-gray-400 border-gray-200 bg-gray-100 dark:bg-gray-800 dark:border-gray-700'

          return (
            <Tooltip key={achievement.id}>
              <TooltipTrigger asChild>
                <Card
                  className={cn(
                    'cursor-pointer transition-all hover:scale-105',
                    !isUnlocked && 'opacity-60'
                  )}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div
                      className={cn(
                        'w-16 h-16 rounded-full border-2 flex items-center justify-center mb-3',
                        colorClass
                      )}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                    <h4 className="font-medium text-sm line-clamp-2 text-gray-900 dark:text-white">
                      {achievement.isSecret && !isUnlocked ? '???' : achievement.name}
                    </h4>
                    {isUnlocked && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        +{achievement.points} pts
                      </p>
                    )}
                    {achievement.progress && achievement.progress < 100 && (
                      <div className="w-full mt-2">
                        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {achievement.progress}%
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {achievement.isSecret && !isUnlocked ? 'Conquista Secreta' : achievement.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {achievement.isSecret && !isUnlocked
                    ? 'Continue jogando para descobrir!'
                    : achievement.description}
                </p>
                {isUnlocked && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Desbloqueada em: {new Date(achievement.unlockedAt!).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </TooltipProvider>
    </div>
  )
}
