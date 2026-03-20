import { useQuery } from '@tanstack/react-query'
import { api } from '~/lib/api'
import { DashboardCardBoundary } from '~/components/dashboard-card-boundary'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { DollarSign, Clock, AlertTriangle, CalendarClock, CircleHelp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'

// Loading Skeleton
function EscolaStatsSkeleton() {
  const stats = [
    {
      title: 'Previsão de Receita',
      description: 'Receita estimada no mês atual',
    },
    {
      title: 'Pagamentos Pendentes',
      description: 'Aguardando quitação',
    },
    {
      title: 'Pagamentos Vencidos',
      description: 'Boletos em atraso',
    },
    {
      title: 'Vencimentos (7 dias)',
      description: 'A vencer no curto prazo',
    },
    {
      title: 'Custo de Manutenção',
      description: 'Custo mensal estimado da folha',
    },
    {
      title: 'Resultado Operacional',
      description: 'Diferença entre recebido e custo',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface EscolaStatsFilters {
  academicPeriodId?: string
  courseId?: string
  levelId?: string
  classId?: string
}

// Content Component
function EscolaStatsContent({
  hideFinancialValues = false,
  academicPeriodId,
  courseId,
  levelId,
  classId,
}: { hideFinancialValues?: boolean } & EscolaStatsFilters) {
  const query = {
    academicPeriodId,
    courseId,
    levelId,
    classId,
  }
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery(api.api.v1.dashboard.escolaStats.queryOptions({ query } as any))

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

  const statsData = stats as any

  const monthlyRevenue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(statsData.monthlyRevenue / 100)

  const breakEvenMonthly = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format((statsData.breakEvenMonthlyCents ?? 0) / 100)

  const breakEvenGap = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Math.abs((statsData.breakEvenGapCents ?? 0) / 100))

  const breakEvenStatusLabel =
    statsData.breakEvenStatus === 'above'
      ? 'Superávit operacional'
      : statsData.breakEvenStatus === 'below'
        ? 'Déficit operacional'
        : 'Empate operacional'

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <p className="text-xs text-muted-foreground">Receita estimada no mês atual</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.pendingPayments}</div>
          <p className="text-xs text-muted-foreground">Aguardando quitação</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagamentos Vencidos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.overduePayments}</div>
          <p className="text-xs text-muted-foreground">Boletos em atraso</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vencimentos (7 dias)</CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.upcomingPayments}</div>
          <p className="text-xs text-muted-foreground">A vencer no curto prazo</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Custo de Manutenção</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {hideFinancialValues ? 'R$ ****' : breakEvenMonthly}
          </div>
          <p className="text-xs text-muted-foreground">Custo mensal estimado da folha</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resultado Operacional</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {hideFinancialValues
              ? 'R$ ****'
              : `${statsData.breakEvenGapCents >= 0 ? '+' : '-'}${breakEvenGap}`}
          </div>
          <p className="text-xs text-muted-foreground">{breakEvenStatusLabel}</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Container Export
export function EscolaStatsContainer({
  hideFinancialValues = false,
  academicPeriodId,
  courseId,
  levelId,
  classId,
}: {
  hideFinancialValues?: boolean
} & EscolaStatsFilters) {
  return (
    <DashboardCardBoundary
      title="Resumo Financeiro"
      queryKeys={[
        api.api.v1.dashboard.escolaStats.queryOptions({
          query: {
            academicPeriodId,
            courseId,
            levelId,
            classId,
          },
        } as any).queryKey,
      ]}
    >
      <EscolaStatsContent
        hideFinancialValues={hideFinancialValues}
        academicPeriodId={academicPeriodId}
        courseId={courseId}
        levelId={levelId}
        classId={classId}
      />
    </DashboardCardBoundary>
  )
}
