import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import { Trophy, Flame, Star, TrendingUp } from 'lucide-react'
import { cn } from '~/lib/utils'

interface GamificationProfileProps {
  totalPoints: number
  currentLevel: number
  levelProgress: number
  streak: number
  longestStreak: number
  achievementsCount: number
  className?: string
}

export function GamificationProfile({
  totalPoints,
  currentLevel,
  levelProgress,
  streak,
  longestStreak,
  achievementsCount,
  className,
}: GamificationProfileProps) {
  const progressPercentage = (levelProgress / 1000) * 100

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Seu Progresso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level and Points */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Nível</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{currentLevel}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pontos Totais</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalPoints.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Progresso para o próximo nível</span>
            <span>{levelProgress} / 1000</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Flame className="h-5 w-5 text-orange-500 mb-1" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">{streak}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Dias Seguidos</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <TrendingUp className="h-5 w-5 text-red-500 mb-1" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {longestStreak}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Recorde</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Star className="h-5 w-5 text-purple-500 mb-1" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {achievementsCount}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Conquistas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
