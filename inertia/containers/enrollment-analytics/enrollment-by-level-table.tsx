import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { Button } from '../../components/ui/button'

import type { Route } from '@tuyau/core/types'
import { api } from '~/lib/api'
import { DashboardCardBoundary } from '~/components/dashboard-card-boundary'

const ITEMS_PER_PAGE = 5

type EnrollmentByLevelResponse = Route.Response<'api.v1.analytics.enrollments.by_level'>

interface EnrollmentByLevelTableProps {
  schoolId?: string
  academicPeriodId?: string
  courseId?: string
  levelId?: string
  classId?: string
}

export function EnrollmentByLevelTable({
  schoolId,
  academicPeriodId,
  courseId,
  levelId,
  classId,
}: EnrollmentByLevelTableProps) {
  return (
    <DashboardCardBoundary
      title="Matrículas por Nível"
      queryKeys={[
        api.api.v1.analytics.enrollments.byLevel.queryOptions({
          query: { schoolId, academicPeriodId, courseId, levelId, classId },
        }).queryKey,
      ]}
    >
      <EnrollmentByLevelTableContent
        schoolId={schoolId}
        academicPeriodId={academicPeriodId}
        courseId={courseId}
        levelId={levelId}
        classId={classId}
      />
    </DashboardCardBoundary>
  )
}

function EnrollmentByLevelTableContent({
  schoolId,
  academicPeriodId,
  courseId,
  levelId,
  classId,
}: EnrollmentByLevelTableProps) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery(
    api.api.v1.analytics.enrollments.byLevel.queryOptions({
      query: { schoolId, academicPeriodId, courseId, levelId, classId },
    })
  )

  if (isLoading || !data) {
    return <EnrollmentByLevelTableSkeleton />
  }

  type EnrollmentByLevelItem = EnrollmentByLevelResponse['byLevel'][number]

  const levels = data.byLevel || []
  const totalPages = Math.ceil(levels.length / ITEMS_PER_PAGE)
  const paginatedLevels = levels.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  if (levels.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum dado disponível</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Não há matrículas registradas para os níveis.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Matrículas por Nível
        </CardTitle>
        <CardDescription>Distribuição de matrículas por nível</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nível</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Concluídas</TableHead>
              <TableHead className="text-right">Pendentes</TableHead>
              <TableHead className="w-32">Progresso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLevels.map((level: EnrollmentByLevelItem) => {
              const completionRate =
                level.totalEnrollments > 0
                  ? Math.round((level.completed / level.totalEnrollments) * 100)
                  : 0

              return (
                <TableRow key={level.levelId}>
                  <TableCell className="font-medium">{level.levelName}</TableCell>
                  <TableCell className="text-right">{level.totalEnrollments}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="default" className="bg-green-600">
                      {level.completed}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {level.pending > 0 ? (
                      <Badge variant="outline" className="border-amber-500 text-amber-600">
                        {level.pending}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={completionRate} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-8">{completionRate}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <span className="text-sm text-muted-foreground">
              {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function EnrollmentByLevelTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Matrículas por Nível
        </CardTitle>
        <CardDescription>Distribuição de matrículas por nível</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
