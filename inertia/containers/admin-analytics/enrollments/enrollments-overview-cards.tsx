import { useQuery } from '@tanstack/react-query'
import { Users, UserPlus, UserMinus, Clock, TrendingUp } from 'lucide-react'
import { useSearchParams } from '../../../hooks/use-search-params'
import { useEnrollmentsOverviewQueryOptions } from '../../../hooks/queries/use-enrollments-overview'
import { StatCard } from '../shared/stat-card'
import { OverviewCardsSkeleton } from '../shared/overview-cards-skeleton'
import { ChartContainer } from '../shared/chart-container'

export function EnrollmentsOverviewCards() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    useEnrollmentsOverviewQueryOptions({
      schoolId: params.schoolId,
      schoolChainId: params.schoolChainId,
    })
  )

  if (isLoading) {
    return <OverviewCardsSkeleton count={5} />
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
        Erro ao carregar dados de matrículas
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Total de Alunos"
        value={data.totalStudents.toLocaleString('pt-BR')}
        icon={Users}
      />
      <StatCard
        title="Alunos Ativos"
        value={data.activeStudents.toLocaleString('pt-BR')}
        description={`${data.activeRate}% do total`}
        icon={UserPlus}
      />
      <StatCard
        title="Matrículas Pendentes"
        value={data.pendingStudents.toLocaleString('pt-BR')}
        icon={Clock}
      />
      <StatCard
        title="Cancelamentos"
        value={data.cancelledStudents.toLocaleString('pt-BR')}
        icon={UserMinus}
      />
      <StatCard
        title="Novas (30 dias)"
        value={data.recentEnrollments.toLocaleString('pt-BR')}
        icon={TrendingUp}
      />
    </div>
  )
}

export function EnrollmentsByLevelChart() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    useEnrollmentsOverviewQueryOptions({
      schoolId: params.schoolId,
      schoolChainId: params.schoolChainId,
    })
  )

  const maxStudents = data?.byLevel
    ? Math.max(...data.byLevel.map((l: any) => l.studentCount), 1)
    : 1

  return (
    <ChartContainer
      title="Alunos por Série"
      description="Distribuição de matrículas por ano/semestre"
      isLoading={isLoading}
      error={error}
    >
      {data && data.byLevel && data.byLevel.length > 0 ? (
        <div className="space-y-3">
          {data.byLevel.map((level: any) => (
            <div key={level.levelName} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{level.levelName}</span>
                <span className="text-muted-foreground">{level.studentCount} alunos</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${(level.studentCount / maxStudents) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Nenhum dado disponível
        </div>
      )}
    </ChartContainer>
  )
}
