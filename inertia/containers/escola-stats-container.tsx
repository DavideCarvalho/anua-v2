import { useQuery } from '@tanstack/react-query'
import { api } from '~/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Users, GraduationCap, DollarSign, TrendingUp, CircleHelp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'

// Loading Skeleton
function EscolaStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Content Component
function EscolaStatsContent({ hideFinancialValues = false }: { hideFinancialValues?: boolean }) {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery(api.api.v1.dashboard.escolaStats.queryOptions({}))

  if (isLoading || !stats) {
    return <EscolaStatsSkeleton />
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-6 text-sm text-destructive">
          Erro ao carregar estatísticas
        </CardContent>
      </Card>
    )
  }

  const monthlyRevenue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(stats.monthlyRevenue / 100)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeStudents}</div>
          <p className="text-xs text-muted-foreground">
            Em {stats.activeAcademicPeriods}{' '}
            {stats.activeAcademicPeriods === 1 ? 'período letivo ativo' : 'períodos letivos ativos'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Professores</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTeachers}</div>
          <p className="text-xs text-muted-foreground">Cadastrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            Previsão de Receita
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Como a previsão de receita é calculada"
                  >
                    <CircleHelp className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs leading-relaxed">
                  Considera pagamentos previstos do mês (mensalidade, matrícula, loja, cantina, aula
                  extra e outros). Não considera multas por atraso nem descontos por pagamento no
                  prazo.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {hideFinancialValues ? 'R$ ****' : monthlyRevenue}
          </div>
          <p className="text-xs text-muted-foreground">
            Baseado em {stats.activeStudents} alunos ativos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Presença</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
          <p className="text-xs text-muted-foreground">Este mês</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Container Export
export function EscolaStatsContainer({
  hideFinancialValues = false,
}: {
  hideFinancialValues?: boolean
}) {
  return <EscolaStatsContent hideFinancialValues={hideFinancialValues} />
}
