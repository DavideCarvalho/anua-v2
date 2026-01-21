import { useQuery } from '@tanstack/react-query'
import { Users, CheckCircle, XCircle, Clock, FileCheck } from 'lucide-react'
import { useSearchParams } from '../../../hooks/use-search-params'
import { useAttendanceOverviewQueryOptions } from '../../../hooks/queries/use-attendance-overview'
import { StatCard } from '../shared/stat-card'
import { OverviewCardsSkeleton } from '../shared/overview-cards-skeleton'

export function AttendanceOverviewCards() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    useAttendanceOverviewQueryOptions({
      schoolId: params.schoolId,
      schoolChainId: params.schoolChainId,
    })
  )

  if (isLoading) {
    return <OverviewCardsSkeleton count={6} />
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
        Erro ao carregar dados de presença
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        title="Total de Alunos"
        value={data.totalStudents.toLocaleString('pt-BR')}
        icon={Users}
      />
      <StatCard
        title="Taxa de Presença"
        value={`${data.attendanceRate}%`}
        icon={CheckCircle}
      />
      <StatCard
        title="Total de Faltas"
        value={data.absentCount.toLocaleString('pt-BR')}
        description={`${data.absentRate}% das aulas`}
        icon={XCircle}
      />
      <StatCard
        title="Atrasos"
        value={data.lateCount.toLocaleString('pt-BR')}
        description={`${data.lateRate}% das aulas`}
        icon={Clock}
      />
      <StatCard
        title="Faltas Justificadas"
        value={data.justifiedCount.toLocaleString('pt-BR')}
        description={`${data.justificationRate}% das faltas`}
        icon={FileCheck}
      />
      <StatCard
        title="Total de Registros"
        value={data.totalRecords.toLocaleString('pt-BR')}
        icon={Users}
      />
    </div>
  )
}
