import { useQuery } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { useSearchParams } from '../../../hooks/use_search_params'
import { useAtRiskStudentsQueryOptions } from '../../../hooks/queries/use_at_risk_students'
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

export function AtRiskStudentsTable() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    useAtRiskStudentsQueryOptions({
      schoolId: params.schoolId,
      schoolChainId: params.schoolChainId,
    })
  )

  return (
    <ChartContainer
      title="Alunos em Risco Acadêmico"
      description="Estudantes com média abaixo do mínimo da escola"
      isLoading={isLoading}
      error={error}
    >
      {data && data.students && data.students.length > 0 ? (
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
            {data.students.slice(0, 10).map((student: any) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
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
