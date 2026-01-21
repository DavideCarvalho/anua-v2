import { useSuspenseQuery } from '@tanstack/react-query'
import { BarChart3 } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

import { useGradeDistributionQueryOptions } from '../../hooks/queries/use-grade-distribution'

interface GradeDistributionChartProps {
  schoolId?: string
}

export function GradeDistributionChart({ schoolId }: GradeDistributionChartProps) {
  const { data } = useSuspenseQuery(useGradeDistributionQueryOptions({ schoolId }))

  // Create distribution buckets if data exists
  const distribution = data.distribution || []
  const maxCount = Math.max(...distribution.map((d: any) => d.count), 1)

  const getBarColor = (range: string) => {
    if (range.includes('0-') || range.includes('1-') || range.includes('2-') || range.includes('3-')) {
      return 'bg-red-500'
    }
    if (range.includes('4-') || range.includes('5-')) {
      return 'bg-yellow-500'
    }
    if (range.includes('6-') || range.includes('7-')) {
      return 'bg-blue-500'
    }
    return 'bg-green-500'
  }

  if (distribution.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribuicao de Notas
          </CardTitle>
          <CardDescription>
            Distribuicao das notas por faixa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Sem dados</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Ainda nao ha notas registradas para exibir a distribuicao.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Distribuicao de Notas
        </CardTitle>
        <CardDescription>
          Distribuicao das notas por faixa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {distribution.map((item: any, index: number) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.range}</span>
                <span className="text-muted-foreground">
                  {item.count} aluno{item.count !== 1 ? 's' : ''} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-4 w-full rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full transition-all', getBarColor(item.range))}
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {data.summary && (
          <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{data.summary.average?.toFixed(1) || '-'}</p>
              <p className="text-xs text-muted-foreground">Media Geral</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{data.summary.median?.toFixed(1) || '-'}</p>
              <p className="text-xs text-muted-foreground">Mediana</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{data.summary.passRate?.toFixed(1) || '-'}%</p>
              <p className="text-xs text-muted-foreground">Taxa de Aprovacao</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function GradeDistributionChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
