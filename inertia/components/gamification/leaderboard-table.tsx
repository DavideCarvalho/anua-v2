import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Trophy, Medal, Award } from 'lucide-react'
import { cn } from '~/lib/utils'

interface LeaderboardEntry {
  rank: number
  studentId: string
  score: number
  student: {
    id: string
    name: string
    imageUrl?: string
    class?: {
      id: string
      name: string
    }
  }
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentStudentId?: string
  className?: string
}

const rankIcons = {
  1: Trophy,
  2: Medal,
  3: Award,
}

const rankColors = {
  1: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  2: 'text-gray-400 bg-gray-50 dark:bg-gray-800',
  3: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
}

export function LeaderboardTable({ entries, currentStudentId, className }: LeaderboardTableProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Ranking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry) => {
            const isCurrentUser = entry.studentId === currentStudentId
            const RankIcon = rankIcons[entry.rank as keyof typeof rankIcons]
            const rankColor = rankColors[entry.rank as keyof typeof rankColors]

            return (
              <div
                key={entry.studentId}
                className={cn(
                  'flex items-center gap-4 p-3 rounded-lg transition-colors',
                  isCurrentUser &&
                    'bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
                  !isCurrentUser && 'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                {/* Rank */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                    rankColor || 'bg-gray-100 dark:bg-gray-800'
                  )}
                >
                  {RankIcon ? <RankIcon className="w-5 h-5" /> : entry.rank}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.student.imageUrl} />
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
                    {entry.student.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-gray-900 dark:text-white">
                    {entry.student.name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(Você)</span>
                    )}
                  </p>
                  {entry.student.class && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {entry.student.class.name}
                    </p>
                  )}
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {entry.score.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">pontos</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
