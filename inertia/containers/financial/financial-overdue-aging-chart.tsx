import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { AlertTriangle } from 'lucide-react'

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

interface FinancialChartFilters {
  academicPeriodId?: string
  courseId?: string
  levelId?: string
  classId?: string
}

const config = {
  amountCents: {
    label: 'Valor em atraso',
    color: 'var(--chart-3)',
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

export function FinancialOverdueAgingChart({
  hideFinancialValues = false,
  academicPeriodId,
  courseId,
  levelId,
  classId,
}: { hideFinancialValues?: boolean } & FinancialChartFilters) {
  const query = { academicPeriodId, courseId, levelId, classId }

  return (
    <DashboardCardBoundary
      title="Aging da Inadimplência"
      queryKeys={[api.api.v1.dashboard.escolaStats.queryOptions({ query } as any).queryKey]}
    >
      <FinancialOverdueAgingChartContent
        hideFinancialValues={hideFinancialValues}
        academicPeriodId={academicPeriodId}
        courseId={courseId}
        levelId={levelId}
        classId={classId}
      />
    </DashboardCardBoundary>
  )
}

function FinancialOverdueAgingChartContent({
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
    return <FinancialOverdueAgingChartSkeleton />
  }

  const aging = (data as any).overdueAging
  const ranges = Array.isArray(aging?.ranges) ? aging.ranges : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Aging da Inadimplência
        </CardTitle>
        <CardDescription>Faixas de atraso por valor pendente</CardDescription>
      </CardHeader>
      <CardContent className="relative h-[320px]">
        <ChartContainer config={config} className="h-full w-full! aspect-auto">
          <BarChart data={ranges} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
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
                  formatter={(value, name, item) => {
                    if (name === 'amountCents') {
                      return (
                        <div className="flex w-full items-center justify-between gap-3">
                          <span className="text-muted-foreground">Valor em atraso</span>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {hideFinancialValues ? 'R$ ****' : formatCurrency(Number(value))}
                          </span>
                        </div>
                      )
                    }

                    return (
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="text-muted-foreground">Faturas</span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {Number(item?.payload?.count ?? 0)}
                        </span>
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar dataKey="amountCents" fill="var(--color-amountCents)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ChartContainer>
        {hideFinancialValues ? <BlurOverlay /> : null}
      </CardContent>
    </Card>
  )
}

function FinancialOverdueAgingChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Aging da Inadimplência
        </CardTitle>
        <CardDescription>Faixas de atraso por valor pendente</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        <Skeleton className="h-full w-full" />
      </CardContent>
    </Card>
  )
}
