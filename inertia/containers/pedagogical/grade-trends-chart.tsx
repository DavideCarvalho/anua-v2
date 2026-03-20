import { useQuery } from '@tanstack/react-query'
import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { DashboardCardBoundary } from '~/components/dashboard-card-boundary'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '~/components/ui/chart'
import { Skeleton } from '~/components/ui/skeleton'
import { api } from '~/lib/api'

const gradeTrendConfig = {
  averageGrade: {
    label: 'Media semanal',
    color: 'var(--chart-1)',
  },
  gradedCount: {
    label: 'Avaliacoes',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function GradeTrendsChart() {
  return <GradeTrendsChartWithFilters />
}

interface GradeTrendsFilters {
  academicPeriodId?: string
  classId?: string
}

export function GradeTrendsChartWithFilters({
  academicPeriodId,
  classId,
}: GradeTrendsFilters = {}) {
  const query = { academicPeriodId, classId }

  return (
    <DashboardCardBoundary
      title="Evolução de Notas"
      queryKeys={[api.api.v1.grades.trends.queryOptions({ query } as any).queryKey]}
    >
      <GradeTrendsChartContent academicPeriodId={academicPeriodId} classId={classId} />
    </DashboardCardBoundary>
  )
}

function GradeTrendsChartContent({ academicPeriodId, classId }: GradeTrendsFilters) {
  const { data, isLoading } = useQuery(
    api.api.v1.grades.trends.queryOptions({ query: { academicPeriodId, classId } } as any)
  )

  if (isLoading || !data) {
    return <GradeTrendsChartSkeleton />
  }

  const trends = data.trends ?? []

  if (trends.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução de Notas
          </CardTitle>
          <CardDescription>Média geral por semana</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Nenhum dado de notas disponível
          </div>
        </CardContent>
      </Card>
    )
  }

  const overallAverage = data.overallAverage ?? 0
  const chartData = trends.map((trend: any) => {
    const dayLabel = new Date(trend.period).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })

    return {
      period: trend.period,
      dayLabel,
      averageGrade: Number(trend.averageGrade ?? 0),
      gradedCount: Number(trend.gradedCount ?? 0),
    }
  })

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução de Notas
            </CardTitle>
            <CardDescription>Média geral por semana</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{overallAverage.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Média geral</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex h-[320px] flex-col gap-4 pt-2">
        <div className="h-[220px]">
          <ChartContainer config={gradeTrendConfig} className="h-full w-full! aspect-auto">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="dayLabel" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 10]} tickLine={false} axisLine={false} width={26} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(_, payload) => {
                      const point = payload?.[0]?.payload
                      if (!point) {
                        return null
                      }

                      return (
                        <div className="font-medium text-foreground">
                          Semana de {point.dayLabel}
                        </div>
                      )
                    }}
                    formatter={(value, name) => {
                      if (name === 'averageGrade') {
                        return (
                          <div className="flex w-full items-center justify-between gap-3">
                            <span className="text-muted-foreground">Média semanal</span>
                            <span className="font-mono font-medium tabular-nums text-foreground">
                              {Number(value).toFixed(1)}
                            </span>
                          </div>
                        )
                      }

                      return (
                        <div className="flex w-full items-center justify-between gap-3">
                          <span className="text-muted-foreground">Avaliações</span>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {Number(value)}
                          </span>
                        </div>
                      )
                    }}
                  />
                }
              />
              <Line
                dataKey="averageGrade"
                type="monotone"
                stroke="var(--color-averageGrade)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="h-[84px] border-t pt-3">
          <ChartContainer config={gradeTrendConfig} className="h-full w-full! aspect-auto">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
              barCategoryGap="18%"
            >
              <XAxis dataKey="dayLabel" hide />
              <YAxis hide />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(_, payload) => {
                      const point = payload?.[0]?.payload
                      if (!point) {
                        return null
                      }

                      return (
                        <div className="font-medium text-foreground">
                          Semana de {point.dayLabel}
                        </div>
                      )
                    }}
                  />
                }
              />
              <Bar dataKey="gradedCount" fill="var(--color-gradedCount)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function GradeTrendsChartSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Evolução de Notas
        </CardTitle>
        <CardDescription>Média geral por semana</CardDescription>
      </CardHeader>
      <CardContent className="flex h-[320px] flex-col gap-4 pt-2">
        <Skeleton className="h-[220px] w-full" />
        <Skeleton className="h-[84px] w-full" />
      </CardContent>
    </Card>
  )
}
