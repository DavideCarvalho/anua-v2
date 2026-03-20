import { useQuery } from '@tanstack/react-query'
import { BarChart3 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { api } from '~/lib/api'
import { cn } from '~/lib/utils'
import { DashboardCardBoundary } from '~/components/dashboard-card-boundary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'

const ITEMS_PER_PAGE = 5

interface ClassPerformanceChartProps {
  defaultAcademicPeriodFilter?: string
  defaultClassFilter?: string
}

export function ClassPerformanceChart({
  defaultAcademicPeriodFilter,
  defaultClassFilter,
}: ClassPerformanceChartProps) {
  return (
    <DashboardCardBoundary
      title="Desempenho por Turma"
      queryKeys={[api.api.v1.analytics.classPerformance.queryOptions({}).queryKey]}
    >
      <ClassPerformanceChartContent
        defaultAcademicPeriodFilter={defaultAcademicPeriodFilter}
        defaultClassFilter={defaultClassFilter}
      />
    </DashboardCardBoundary>
  )
}

function ClassPerformanceChartContent({
  defaultAcademicPeriodFilter,
  defaultClassFilter,
}: ClassPerformanceChartProps) {
  const { data, isLoading } = useQuery(api.api.v1.analytics.classPerformance.queryOptions({}))
  const [page, setPage] = useState(1)

  const classes = data?.classes ?? []
  const hasNoData = classes.length === 0

  const maxGrade = 10

  const filteredClasses = useMemo(() => {
    return classes.filter((cls: any) => {
      const matchesClass = !defaultClassFilter || String(cls.classId) === defaultClassFilter
      if (!matchesClass) {
        return false
      }

      const periods = Array.isArray(cls.academicPeriods)
        ? cls.academicPeriods.map((item: string) => String(item))
        : []
      const matchesAcademicPeriod =
        !defaultAcademicPeriodFilter || periods.includes(defaultAcademicPeriodFilter)
      if (!matchesAcademicPeriod) {
        return false
      }

      return true
    })
  }, [classes, defaultAcademicPeriodFilter, defaultClassFilter])

  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const pageItems = filteredClasses.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  useEffect(() => {
    if (currentPage !== page) {
      setPage(currentPage)
    }
  }, [currentPage, page])

  useEffect(() => {
    setPage(1)
  }, [defaultAcademicPeriodFilter, defaultClassFilter])

  if (isLoading || !data) {
    return <ClassPerformanceChartSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Desempenho por Turma
        </CardTitle>
        <CardDescription>Comparativo de notas e frequência</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-xs text-muted-foreground">
          {filteredClasses.length} turma{filteredClasses.length !== 1 ? 's' : ''}
        </div>

        {hasNoData ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Nenhum dado de turma disponível
          </div>
        ) : pageItems.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Nenhuma turma encontrada para os filtros aplicados
          </div>
        ) : (
          <div className="space-y-3">
            {pageItems.map((cls: any) => {
              const gradeWidth = cls.averageGrade !== null ? (cls.averageGrade / maxGrade) * 100 : 0
              const gradeColor =
                cls.averageGrade !== null
                  ? cls.averageGrade >= 7
                    ? 'bg-green-500'
                    : cls.averageGrade >= 5
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  : 'bg-muted'

              return (
                <div key={cls.classId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cls.className}</span>
                      {Array.isArray(cls.academicPeriods) && cls.academicPeriods.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {cls.academicPeriods[0]}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {cls.studentCount} aluno{cls.studentCount !== 1 ? 's' : ''}
                      </Badge>
                      {cls.atRiskCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {cls.atRiskCount} em risco
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {cls.attendanceRate !== null && <span>Freq: {cls.attendanceRate}%</span>}
                      {cls.averageGrade !== null && (
                        <span className="font-medium text-foreground">
                          Média: {cls.averageGrade.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted">
                    <div
                      className={cn('h-full rounded-full transition-all', gradeColor)}
                      style={{ width: `${gradeWidth}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <span className="text-xs text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Próxima
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ClassPerformanceChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-9 w-[220px]" />
          <Skeleton className="h-9 w-[260px]" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
