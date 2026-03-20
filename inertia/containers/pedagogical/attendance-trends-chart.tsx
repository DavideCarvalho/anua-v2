import { useQuery } from '@tanstack/react-query'
import { Clock } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

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

const chartConfig = {
  present: {
    label: 'Presentes',
    color: 'var(--chart-2)',
  },
  absent: {
    label: 'Ausentes',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig

export function PedagogicalAttendanceTrendsChart() {
  return <PedagogicalAttendanceTrendsChartWithFilters />
}

interface AttendanceTrendFilters {
  academicPeriodId?: string
  courseId?: string
  classId?: string
}

export function PedagogicalAttendanceTrendsChartWithFilters({
  academicPeriodId,
  courseId,
  classId,
}: AttendanceTrendFilters = {}) {
  const query = { period: 'month' as const, academicPeriodId, courseId, classId }

  return (
    <DashboardCardBoundary
      title="Tendência de Frequência"
      queryKeys={[api.api.v1.analytics.attendance.trends.queryOptions({ query } as any).queryKey]}
    >
      <PedagogicalAttendanceTrendsChartContent
        academicPeriodId={academicPeriodId}
        courseId={courseId}
        classId={classId}
      />
    </DashboardCardBoundary>
  )
}

function PedagogicalAttendanceTrendsChartContent({
  academicPeriodId,
  courseId,
  classId,
}: AttendanceTrendFilters) {
  const { data, isLoading } = useQuery(
    api.api.v1.analytics.attendance.trends.queryOptions({
      query: { period: 'month', academicPeriodId, courseId, classId },
    } as any)
  )

  if (isLoading || !data) {
    return <PedagogicalAttendanceTrendsChartSkeleton />
  }

  const trends = data.trends ?? []

  if (trends.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tendência de Frequência
          </CardTitle>
          <CardDescription>Taxa de presença ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Nenhum dado de frequência disponível
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = trends.map((trend: any) => {
    const dateParts = String(trend.period).split('-')
    const shortDate =
      dateParts.length >= 3 ? `${dateParts[1]}/${dateParts[2]}` : String(trend.period)

    return {
      period: String(trend.period),
      shortDate,
      present: Number(trend.present ?? 0),
      absent: Number(trend.absent ?? 0),
      attendanceRate: Number(trend.attendanceRate ?? 0),
      total: Number(trend.total ?? 0),
    }
  })

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Tendência de Frequência
        </CardTitle>
        <CardDescription>Últimos 30 dias</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px] pt-2">
        <ChartContainer config={chartConfig} className="h-full w-full! aspect-auto">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            barCategoryGap="18%"
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="shortDate"
              tickLine={false}
              axisLine={false}
              interval={4}
              minTickGap={18}
            />
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
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{point.period}</div>
                        <div className="text-muted-foreground">
                          Presença: {point.attendanceRate}%
                        </div>
                      </div>
                    )
                  }}
                  formatter={(value, name, item) => {
                    const point = item.payload as {
                      present: number
                      absent: number
                      total: number
                    }
                    const normalizedValue = Number(value)
                    const percentage =
                      point.total > 0 ? Math.round((normalizedValue / point.total) * 100) : 0

                    return (
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="text-muted-foreground">
                          {name === 'present' ? 'Presentes' : 'Ausentes'}
                        </span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {normalizedValue} ({percentage}%)
                        </span>
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar
              dataKey="present"
              stackId="attendance"
              radius={[4, 4, 0, 0]}
              fill="var(--color-present)"
            />
            <Bar
              dataKey="absent"
              stackId="attendance"
              radius={[0, 0, 0, 0]}
              fill="var(--color-absent)"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function PedagogicalAttendanceTrendsChartSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Tendência de Frequência
        </CardTitle>
        <CardDescription>Últimos 30 dias</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px] pt-2">
        <Skeleton className="h-full w-full" />
      </CardContent>
    </Card>
  )
}
