import { useQuery } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { useSearchParams } from '../../../hooks/use_search_params'
import { api } from '~/lib/api'
import type { Route } from '@tuyau/core/types'
import { ChartContainer } from '../shared/chart-container'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import { Badge } from '../../../components/ui/badge'

type AtRiskResponse = Route.Response<'api.v1.grades.at_risk'>
type AtRiskStudent = AtRiskResponse['topStudents'][number]

export function AtRiskStudentsTable() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    api.api.v1.grades.atRisk.queryOptions({
      query: {
        schoolId: params.schoolId,
        schoolChainId: params.schoolChainId,
      },
    })
  )

  const students: AtRiskStudent[] = data?.topStudents ?? []

  return (
    <ChartContainer
      title="Alunos em Risco Acadêmico"
      description="Estudantes com média abaixo do mínimo da escola"
      isLoading={isLoading}
      error={error instanceof Error ? error : undefined}
    >
      {students.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Escola</TableHead>
              <TableHead className="text-right">Média</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.slice(0, 10).map((student) => (
              <TableRow key={student.studentId}>
                <TableCell className="font-medium">{student.studentName}</TableCell>
                <TableCell>{student.schoolName}</TableCell>
                <TableCell className="text-right">{student.averageGrade?.toFixed(1)}%</TableCell>
                <TableCell className="text-right">
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Em risco
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Nenhum aluno em risco encontrado
        </div>
      )}
    </ChartContainer>
  )
}
