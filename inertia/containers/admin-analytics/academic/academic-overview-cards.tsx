import { useQuery } from '@tanstack/react-query'
import { GraduationCap, BookOpen, CheckCircle, AlertTriangle, Users, FileText } from 'lucide-react'
import { useSearchParams } from '../../../hooks/use_search_params'
import { useAcademicOverviewQueryOptions } from '../../../hooks/queries/use_academic_overview'
import { StatCard } from '../shared/stat-card'
import { OverviewCardsSkeleton } from '../shared/overview-cards-skeleton'

export function AcademicOverviewCards() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    useAcademicOverviewQueryOptions({
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
        Erro ao carregar dados acadêmicos
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
        title="Total de Atividades"
        value={data.totalAssignments.toLocaleString('pt-BR')}
        icon={FileText}
      />
      <StatCard
        title="Atividades Avaliadas"
        value={data.gradedAssignments.toLocaleString('pt-BR')}
        icon={CheckCircle}
      />
      <StatCard
        title="Média Geral"
        value={`${data.averageGrade}%`}
        icon={GraduationCap}
      />
      <StatCard
        title="Taxa de Conclusão"
        value={`${data.completionRate}%`}
        icon={BookOpen}
      />
      <StatCard
        title="Alunos em Risco"
        value={data.atRiskStudents.toLocaleString('pt-BR')}
        description={`${data.atRiskPercentage}% do total`}
        icon={AlertTriangle}
      />
    </div>
  )
}
