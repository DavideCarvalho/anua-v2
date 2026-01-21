import { useQuery } from '@tanstack/react-query'
import { Users, GraduationCap, Clock, CheckCircle, Building2 } from 'lucide-react'
import { useSearchParams } from '../../../hooks/use-search-params'
import { useHrOverviewQueryOptions } from '../../../hooks/queries/use-hr-overview'
import { StatCard } from '../shared/stat-card'
import { OverviewCardsSkeleton } from '../shared/overview-cards-skeleton'
import { ChartContainer } from '../shared/chart-container'

export function HrOverviewCards() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    useHrOverviewQueryOptions({
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
        Erro ao carregar dados de RH
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Funcionários"
        value={data.totalEmployees.toLocaleString('pt-BR')}
        description="com registro de ponto"
        icon={Users}
      />
      <StatCard
        title="Professores"
        value={data.totalTeachers.toLocaleString('pt-BR')}
        description={`${data.teachersWithClasses} com turmas`}
        icon={GraduationCap}
      />
      <StatCard
        title="Registros de Ponto"
        value={data.totalTimesheetRecords.toLocaleString('pt-BR')}
        description="últimos 30 dias"
        icon={Clock}
      />
      <StatCard
        title="Ponto Completo"
        value={`${data.timesheetCompletionRate}%`}
        description={`${data.completedTimesheets} registros`}
        icon={CheckCircle}
      />
      <StatCard
        title="Ponto Incompleto"
        value={data.incompleteTimesheets.toLocaleString('pt-BR')}
        icon={Clock}
      />
    </div>
  )
}

export function HrBySchoolChart() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    useHrOverviewQueryOptions({
      schoolId: params.schoolId,
      schoolChainId: params.schoolChainId,
    })
  )

  return (
    <ChartContainer
      title="Equipe por Escola"
      description="Distribuição de funcionários e professores"
      isLoading={isLoading}
      error={error}
    >
      {data && data.bySchool && data.bySchool.length > 0 ? (
        <div className="space-y-4">
          {data.bySchool.map((school: any) => (
            <div key={school.schoolName} className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {school.schoolName}
              </div>
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                  <span className="text-sm text-muted-foreground">Funcionários</span>
                  <span className="font-medium">{school.employeeCount}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                  <span className="text-sm text-muted-foreground">Professores</span>
                  <span className="font-medium">{school.teacherCount}</span>
                </div>
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
