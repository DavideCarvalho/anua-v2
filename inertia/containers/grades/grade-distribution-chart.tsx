import { useQuery } from '@tanstack/react-query'
import { BarChart3 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

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

const gradeDistributionConfig = {
  count: {
    label: 'Alunos',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

interface GradeDistributionChartProps {
  academicPeriodId?: string
  classId?: string
}

export function GradeDistributionChart({ academicPeriodId, classId }: GradeDistributionChartProps) {
  const query = { academicPeriodId, classId }

  return (
    <DashboardCardBoundary
      title="Distribuição de Notas"
      queryKeys={[api.api.v1.grades.distribution.queryOptions({ query } as any).queryKey]}
    >
      <GradeDistributionChartContent academicPeriodId={academicPeriodId} classId={classId} />
    </DashboardCardBoundary>
  )
}

function GradeDistributionChartContent({ academicPeriodId, classId }: GradeDistributionChartProps) {
  const { data, isLoading } = useQuery(
    api.api.v1.grades.distribution.queryOptions({ query: { academicPeriodId, classId } } as any)
  )

  if (isLoading) {
    return <GradeDistributionChartSkeleton />
  }

  const distribution = data?.distribution || []
  const totalGrades = data?.totalGrades ?? 0

  if (totalGrades === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribuição de Notas
          </CardTitle>
          <CardDescription>Distribuição das notas por faixa</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-base font-semibold">Sem dados avaliados na Silva Gomes</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Existem alunos e presenças, mas ainda não há notas lançadas para atividades/provas.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = distribution.map((item: any) => ({
    range: item.range,
    count: Number(item.count ?? 0),
    percentage: Number(item.percentage ?? 0),
    label: `${item.count} aluno${item.count !== 1 ? 's' : ''} (${Number(item.percentage ?? 0).toFixed(1)}%)`,
  }))

  const computedPassRate =
    totalGrades > 0
      ? (chartData
          .filter((item) => item.range === '60-80%' || item.range === '80-100%')
          .reduce((sum, item) => sum + item.count, 0) /
          totalGrades) *
        100
      : 0

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Distribuição de Notas
        </CardTitle>
        <CardDescription>Distribuição das notas por faixa</CardDescription>
      </CardHeader>
      <CardContent className="flex h-[320px] flex-col gap-4 pt-2">
        <div className="h-[220px]">
          <ChartContainer config={gradeDistributionConfig} className="h-full w-full! aspect-auto">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <YAxis
                dataKey="range"
                type="category"
                axisLine={false}
                tickLine={false}
                width={58}
                tickMargin={8}
              />
              <XAxis
                dataKey="count"
                type="number"
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
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

                      return <div className="font-medium text-foreground">Faixa {point.range}</div>
                    }}
                    formatter={(value, _name, item) => {
                      const point = item.payload as { percentage: number }

                      return (
                        <div className="flex w-full items-center justify-between gap-3">
                          <span className="text-muted-foreground">Alunos</span>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {Number(value)} ({point.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      )
                    }}
                  />
                }
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={4}>
                <LabelList
                  dataKey="label"
                  position="right"
                  className="fill-muted-foreground"
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t pt-3">
          <div className="text-center">
            <p className="text-2xl font-bold">{(data?.average ?? 0).toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Média Geral</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{(data?.median ?? 0).toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Mediana</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{computedPassRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Taxa de Aprovação</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function GradeDistributionChartSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Distribuição de Notas
        </CardTitle>
        <CardDescription>Distribuição das notas por faixa</CardDescription>
      </CardHeader>
      <CardContent className="flex h-[320px] flex-col gap-4 pt-2">
        <Skeleton className="h-[220px] w-full" />
        <div className="grid grid-cols-3 gap-3 border-t pt-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
