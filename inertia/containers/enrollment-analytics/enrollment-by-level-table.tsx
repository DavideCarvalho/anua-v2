import { useSuspenseQuery } from '@tanstack/react-query'
import { GraduationCap } from 'lucide-react'

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

import { useEnrollmentByLevelQueryOptions } from '../../hooks/queries/use_enrollment_by_level'

interface EnrollmentByLevelTableProps {
  schoolId?: string
  academicPeriodId?: string
}

export function EnrollmentByLevelTable({ schoolId, academicPeriodId }: EnrollmentByLevelTableProps) {
  const { data } = useSuspenseQuery(
    useEnrollmentByLevelQueryOptions({ schoolId, academicPeriodId })
  )

  const levels = data.byLevel || []

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
            {levels.map((level: any) => {
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
      </CardContent>
    </Card>
  )
}

export function EnrollmentByLevelTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-40 bg-muted animate-pulse rounded" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
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
