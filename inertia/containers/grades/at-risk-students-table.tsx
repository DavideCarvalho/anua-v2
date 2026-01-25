import { useSuspenseQuery } from '@tanstack/react-query'
import { AlertTriangle, Users } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

import { useAtRiskStudentsQueryOptions } from '../../hooks/queries/use_at_risk_students'

interface AtRiskStudentsTableProps {
  schoolId?: string
}

export function AtRiskStudentsTable({ schoolId }: AtRiskStudentsTableProps) {
  const { data } = useSuspenseQuery(useAtRiskStudentsQueryOptions({ schoolId, limit: 20 }))

  if (data.totalAtRisk === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alunos em Risco
          </CardTitle>
          <CardDescription>
            Alunos com media abaixo do minimo exigido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum aluno em risco</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Todos os alunos estao com notas acima do minimo exigido.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Alunos em Risco
            </CardTitle>
            <CardDescription>
              Alunos com media abaixo do minimo exigido
            </CardDescription>
          </div>
          <Badge variant="destructive" className="text-lg">
            {data.totalAtRisk} ({data.atRiskPercentage}%)
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Atividades</TableHead>
              <TableHead className="text-center">Media</TableHead>
              <TableHead className="text-center">Minimo</TableHead>
              <TableHead className="text-center">Deficit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.topStudents.map((student: any) => (
              <TableRow key={student.studentId}>
                <TableCell className="font-medium">{student.studentName}</TableCell>
                <TableCell className="text-muted-foreground">{student.studentEmail}</TableCell>
                <TableCell className="text-center">{student.assignmentsCount}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      student.averageGrade < 4
                        ? 'border-red-500 text-red-500'
                        : 'border-yellow-500 text-yellow-500'
                    )}
                  >
                    {student.averageGrade.toFixed(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{student.minimumRequired}</TableCell>
                <TableCell className="text-center">
                  <span className="text-red-500 font-medium">
                    -{student.deficit.toFixed(1)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function AtRiskStudentsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
              <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
              <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              <div className="h-4 w-12 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
