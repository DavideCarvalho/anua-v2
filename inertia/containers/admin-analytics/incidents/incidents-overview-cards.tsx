import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, AlertCircle, Clock, Calendar, Building2, UserX } from 'lucide-react'
import { useSearchParams } from '../../../hooks/use_search_params'
import { useIncidentsOverviewQueryOptions } from '../../../hooks/queries/use_incidents_overview'
import { StatCard } from '../shared/stat-card'
import { OverviewCardsSkeleton } from '../shared/overview-cards-skeleton'
import { ChartContainer } from '../shared/chart-container'
import { Badge } from '../../../components/ui/badge'

export function IncidentsOverviewCards() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    useIncidentsOverviewQueryOptions({
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
        Erro ao carregar dados de ocorrências
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Total de Ocorrências"
        value={data.totalIncidents.toLocaleString('pt-BR')}
        icon={AlertTriangle}
      />
      <StatCard
        title="Comportamento"
        value={data.behaviorCount.toLocaleString('pt-BR')}
        icon={AlertCircle}
      />
      <StatCard
        title="Faltas"
        value={data.absenceCount.toLocaleString('pt-BR')}
        icon={UserX}
      />
      <StatCard
        title="Atrasos"
        value={data.lateCount.toLocaleString('pt-BR')}
        icon={Clock}
      />
      <StatCard
        title="Últimos 30 dias"
        value={data.recentIncidents.toLocaleString('pt-BR')}
        icon={Calendar}
      />
    </div>
  )
}

export function IncidentsByTypeChart() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    useIncidentsOverviewQueryOptions({
      schoolId: params.schoolId,
      schoolChainId: params.schoolChainId,
    })
  )

  return (
    <ChartContainer
      title="Ocorrências por Tipo"
      description="Distribuição por categoria"
      isLoading={isLoading}
      error={error}
    >
      {data && data.byType && data.byType.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {data.byType.map((item: any) => (
            <Badge key={item.type} variant="secondary" className="px-3 py-1.5 text-sm">
              {item.type}: {item.count}
            </Badge>
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

export function IncidentsBySchoolTable() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    useIncidentsOverviewQueryOptions({
      schoolId: params.schoolId,
      schoolChainId: params.schoolChainId,
    })
  )

  const maxCount = data?.bySchool
    ? Math.max(...data.bySchool.map((s: any) => s.incidentCount), 1)
    : 1

  return (
    <ChartContainer
      title="Ocorrências por Escola"
      description="Top escolas com mais registros"
      isLoading={isLoading}
      error={error}
    >
      {data && data.bySchool && data.bySchool.length > 0 ? (
        <div className="space-y-3">
          {data.bySchool.map((school: any) => (
            <div key={school.schoolName} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {school.schoolName}
                </span>
                <span className="text-muted-foreground">{school.incidentCount}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-amber-500"
                  style={{ width: `${(school.incidentCount / maxCount) * 100}%` }}
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
