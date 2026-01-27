import { Head, Link } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import {
  Trophy,
  Star,
  Medal,
  Target,
  XCircle,
  ArrowLeft,
  Flame,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { ResponsavelLayout } from '../../components/layouts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'

import { useResponsavelStudentGamificationQueryOptions } from '../../hooks/queries/use_student_gamification'

interface GamificacaoDetailsPageProps {
  studentId: string
}

const RARITY_CONFIG: Record<string, { label: string; className: string }> = {
  COMMON: { label: 'Comum', className: 'bg-gray-100 text-gray-700' },
  UNCOMMON: { label: 'Incomum', className: 'bg-green-100 text-green-700' },
  RARE: { label: 'Raro', className: 'bg-blue-100 text-blue-700' },
  EPIC: { label: 'Epico', className: 'bg-purple-100 text-purple-700' },
  LEGENDARY: { label: 'Lendario', className: 'bg-yellow-100 text-yellow-700' },
}

const TRANSACTION_TYPE_CONFIG: Record<string, { label: string; icon: typeof TrendingUp }> = {
  EARN: { label: 'Ganhou', icon: TrendingUp },
  SPEND: { label: 'Gastou', icon: Zap },
  BONUS: { label: 'Bonus', icon: Award },
  PENALTY: { label: 'Penalidade', icon: Target },
}

function GamificacaoDetailsContent({ studentId }: { studentId: string }) {
  const { data, isLoading, isError, error } = useQuery(
    useResponsavelStudentGamificationQueryOptions(studentId)
  )

  if (isLoading) {
    return <GamificacaoDetailsSkeleton />
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">Erro ao carregar dados</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Ocorreu um erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const { student, gamification, achievements, recentTransactions } = data

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/responsavel/gamificacao">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </Link>

      {/* Header with student info */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-yellow-100 rounded-full">
          <Trophy className="h-8 w-8 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{student.name}</h2>
          <p className="text-muted-foreground">Detalhes de Gamificacao</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{gamification.totalPoints}</p>
                <p className="text-sm text-muted-foreground">Pontos Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Medal className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">Nivel {gamification.currentLevel}</p>
                <p className="text-sm text-muted-foreground">Nivel Atual</p>
              </div>
            </div>
            <Progress value={gamification.levelProgress} className="mt-3" />
            <p className="text-xs text-muted-foreground mt-1">
              {gamification.levelProgress}% para o proximo nivel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{gamification.streak} dias</p>
                <p className="text-sm text-muted-foreground">Sequencia Atual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{achievements.length}</p>
                <p className="text-sm text-muted-foreground">Conquistas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Conquistas Desbloqueadas
          </CardTitle>
          <CardDescription>
            Conquistas obtidas pelo aluno
          </CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-4 text-muted-foreground">
                Nenhuma conquista desbloqueada ainda
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => {
                const rarity = RARITY_CONFIG[achievement.rarity] || RARITY_CONFIG.COMMON
                return (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 p-4 border rounded-lg"
                  >
                    <div className="p-2 bg-yellow-100 rounded-lg shrink-0">
                      {achievement.icon ? (
                        <span className="text-2xl">{achievement.icon}</span>
                      ) : (
                        <Medal className="h-6 w-6 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium truncate">{achievement.name}</h4>
                        <Badge className={rarity.className} variant="outline">
                          {rarity.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span>+{achievement.points} pontos</span>
                        <span>-</span>
                        <span>
                          {format(new Date(achievement.unlockedAt), "dd 'de' MMM", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Historico de Pontos
          </CardTitle>
          <CardDescription>
            Ultimas movimentacoes de pontos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-4 text-muted-foreground">
                Nenhuma movimentacao de pontos ainda
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => {
                const isPositive = transaction.points > 0
                const config = TRANSACTION_TYPE_CONFIG[transaction.type] || {
                  label: transaction.type,
                  icon: TrendingUp,
                }
                const Icon = config.icon

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isPositive ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.reason || config.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.createdAt), "dd/MM/yyyy 'as' HH:mm", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {transaction.points}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Saldo: {transaction.balanceAfter}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function GamificacaoDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-24" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function GamificacaoDetailsPage({ studentId }: GamificacaoDetailsPageProps) {
  return (
    <ResponsavelLayout>
      <Head title="Detalhes de Gamificacao" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Gamificacao
          </h1>
          <p className="text-muted-foreground">
            Detalhes de pontos e conquistas do aluno
          </p>
        </div>

        <ErrorBoundary
          fallback={
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="mx-auto h-12 w-12 text-destructive" />
                <h3 className="mt-4 text-lg font-semibold">Erro ao carregar dados</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ocorreu um erro ao renderizar o componente.
                </p>
              </CardContent>
            </Card>
          }
        >
          <GamificacaoDetailsContent studentId={studentId} />
        </ErrorBoundary>
      </div>
    </ResponsavelLayout>
  )
}
