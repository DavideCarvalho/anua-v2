import { Card, CardContent } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import { Target, Clock, Trophy } from 'lucide-react'
import { cn } from '~/lib/utils'

interface Challenge {
  id: string
  name: string
  description: string
  icon?: string
  points: number
  endDate?: string
}

interface StudentChallenge {
  id: string
  challenge: Challenge
  progress: number
  isCompleted: boolean
  completedAt?: string
}

interface ChallengesListProps {
  challenges: StudentChallenge[]
  className?: string
}

export function ChallengesList({ challenges, className }: ChallengesListProps) {
  const activeChallenges = challenges.filter((c) => !c.isCompleted)
  const completedChallenges = challenges.filter((c) => c.isCompleted)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <Target className="h-5 w-5 text-blue-500" />
            Desafios em Andamento
          </h3>
          {activeChallenges.map((studentChallenge) => (
            <Card key={studentChallenge.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {studentChallenge.challenge.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {studentChallenge.challenge.description}
                    </p>
                    {studentChallenge.challenge.endDate && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Termina em:{' '}
                        {new Date(studentChallenge.challenge.endDate).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                      <Trophy className="h-4 w-4" />+{studentChallenge.challenge.points}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {studentChallenge.progress}%
                    </span>
                  </div>
                  <Progress value={studentChallenge.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <Trophy className="h-5 w-5 text-green-500" />
            Desafios Concluídos
          </h3>
          {completedChallenges.map((studentChallenge) => (
            <Card
              key={studentChallenge.id}
              className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {studentChallenge.challenge.name}
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Concluído em:{' '}
                      {studentChallenge.completedAt
                        ? new Date(studentChallenge.completedAt).toLocaleDateString('pt-BR')
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Trophy className="h-4 w-4" />+{studentChallenge.challenge.points} pts
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {challenges.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Nenhum desafio disponível
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Volte em breve para novos desafios!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
