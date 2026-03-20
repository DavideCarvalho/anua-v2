import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, Line, XAxis, YAxis } from 'recharts'
import { CircleHelp, TrendingUp } from 'lucide-react'

import { api } from '~/lib/api'
import { DashboardCardBoundary } from '~/components/dashboard-card-boundary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '~/components/ui/chart'
import { Skeleton } from '~/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

interface FinancialChartFilters {
  academicPeriodId?: string
  courseId?: string
  levelId?: string
  classId?: string
}

const config = {
  predictedAmountCents: {
    label: 'Previsto',
    color: 'var(--chart-1)',
  },
  receivedAmountCents: {
    label: 'Recebido',
    color: 'var(--chart-2)',
  },
  breakEvenCents: {
    label: 'Custo manutenção',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

function BlurOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-md border bg-background/45 backdrop-blur-sm">
      <span className="rounded-md bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground">
        Valores ocultos
      </span>
    </div>
  )
}

export function FinancialRevenueTrendsChart({
  hideFinancialValues = false,
  academicPeriodId,
  courseId,
  levelId,
  classId,
}: { hideFinancialValues?: boolean } & FinancialChartFilters) {
  const query = { academicPeriodId, courseId, levelId, classId }

  return (
    <DashboardCardBoundary
      title="Receita x Custo de Manutenção"
      queryKeys={[api.api.v1.dashboard.escolaStats.queryOptions({ query } as any).queryKey]}
    >
      <FinancialRevenueTrendsChartContent
        hideFinancialValues={hideFinancialValues}
        academicPeriodId={academicPeriodId}
        courseId={courseId}
        levelId={levelId}
        classId={classId}
      />
    </DashboardCardBoundary>
  )
}

function FinancialRevenueTrendsChartContent({
  hideFinancialValues,
  academicPeriodId,
  courseId,
  levelId,
  classId,
}: { hideFinancialValues?: boolean } & FinancialChartFilters) {
  const { data, isLoading } = useQuery(
    api.api.v1.dashboard.escolaStats.queryOptions({
      query: { academicPeriodId, courseId, levelId, classId },
    } as any)
  )

  if (isLoading || !data) {
    return <FinancialRevenueTrendsChartSkeleton />
  }

  const breakEvenCents = Number((data as any).breakEvenMonthlyCents || 0)
  const breakEvenGapCents = Number((data as any).breakEvenGapCents || 0)
  const breakEvenStatus = String((data as any).breakEvenStatus || 'balanced')
  const trendData = (
    Array.isArray((data as any).revenueTrends) ? (data as any).revenueTrends : []
  ).map((point: any) => ({
    ...point,
    breakEvenCents,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Receita x Custo de Manutenção
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Este gráfico é uma projeção"
                >
                  <CircleHelp className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs leading-relaxed">
                Gráfico de projeção: compara receita com custo mensal estimado de manutenção
                (hora-aula de professores + salários de funcionários).
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>Últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent className="relative h-[320px]">
        <div className="mb-2 text-xs text-muted-foreground">
          <span>
            {hideFinancialValues
              ? 'Custo de manutenção: R$ ****'
              : `Custo mensal: ${formatCurrency(breakEvenCents)} (${breakEvenStatus === 'above' ? '+' : ''}${formatCurrency(breakEvenGapCents)})`}
          </span>
        </div>
        <ChartContainer config={config} className="h-full w-full! aspect-auto">
          <BarChart data={trendData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={64}
              tickFormatter={(value) =>
                hideFinancialValues ? '***' : formatCurrency(Number(value))
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name) => {
                    const label =
                      name === 'receivedAmountCents'
                        ? 'Recebido'
                        : name === 'predictedAmountCents'
                          ? 'Previsto'
                          : 'Custo manutenção'
                    const display = hideFinancialValues ? 'R$ ****' : formatCurrency(Number(value))

                    return (
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {display}
                        </span>
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar
              dataKey="predictedAmountCents"
              fill="var(--color-predictedAmountCents)"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="receivedAmountCents"
              fill="var(--color-receivedAmountCents)"
              radius={[3, 3, 0, 0]}
            />
            <Line
              dataKey="breakEvenCents"
              type="monotone"
              stroke="var(--color-breakEvenCents)"
              strokeWidth={2}
              dot={false}
            />
          </BarChart>
        </ChartContainer>
        {hideFinancialValues ? <BlurOverlay /> : null}
      </CardContent>
    </Card>
  )
}

function FinancialRevenueTrendsChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Receita Prevista x Recebida
        </CardTitle>
        <CardDescription>Últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        <Skeleton className="h-full w-full" />
      </CardContent>
    </Card>
  )
}
