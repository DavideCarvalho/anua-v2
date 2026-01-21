import { useSuspenseQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

import { useEnrollmentTrendsQueryOptions } from '../../hooks/queries/use-enrollment-trends'

interface EnrollmentTrendsChartProps {
  schoolId?: string
  academicPeriodId?: string
  days?: number
}

export function EnrollmentTrendsChart({
  schoolId,
  academicPeriodId,
  days = 30,
}: EnrollmentTrendsChartProps) {
  const { data } = useSuspenseQuery(
    useEnrollmentTrendsQueryOptions({ schoolId, academicPeriodId, days })
  )

  const maxEnrollments = Math.max(...data.trends.map((t: any) => t.enrollments), 1)

  // Calculate trend direction
  const recentTrends = data.trends.slice(-7)
  const olderTrends = data.trends.slice(-14, -7)
  const recentAvg =
    recentTrends.length > 0
      ? recentTrends.reduce((sum: number, t: any) => sum + t.enrollments, 0) / recentTrends.length
      : 0
  const olderAvg =
    olderTrends.length > 0
      ? olderTrends.reduce((sum: number, t: any) => sum + t.enrollments, 0) / olderTrends.length
      : 0

  const trendDirection = recentAvg > olderAvg ? 'up' : recentAvg < olderAvg ? 'down' : 'stable'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tendência de Matrículas</CardTitle>
            <CardDescription>Últimos {days} dias</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {trendDirection === 'up' && (
              <TrendingUp className="h-5 w-5 text-green-600" />
            )}
            {trendDirection === 'down' && (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            {trendDirection === 'stable' && (
              <Minus className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">
              Média: {data.average} matrículas/dia
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1 h-48">
          {data.trends.map((trend: any, index: number) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-1 group"
              title={`${format(new Date(trend.date), 'dd/MM', { locale: ptBR })}: ${trend.enrollments} matrículas`}
            >
              <div
                className="w-full bg-primary/80 rounded-t transition-all group-hover:bg-primary"
                style={{
                  height: `${(trend.enrollments / maxEnrollments) * 100}%`,
                  minHeight: trend.enrollments > 0 ? '4px' : '0',
                }}
              />
              {index % 7 === 0 && (
                <span className="text-xs text-muted-foreground -rotate-45 origin-top-left whitespace-nowrap">
                  {format(new Date(trend.date), 'dd/MM', { locale: ptBR })}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Total no período</p>
            <p className="text-2xl font-bold">{data.total}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Média diária</p>
            <p className="text-2xl font-bold">{data.average}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function EnrollmentTrendsChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-40 bg-muted animate-pulse rounded" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1 h-48">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-muted animate-pulse rounded-t"
              style={{ height: `${Math.random() * 100}%` }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="h-12 w-24 bg-muted animate-pulse rounded" />
          <div className="h-12 w-24 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  )
}
