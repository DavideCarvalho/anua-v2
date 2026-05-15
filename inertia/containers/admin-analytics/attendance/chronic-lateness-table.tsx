import { useQuery } from '@tanstack/react-query'
import { Clock } from 'lucide-react'
import { useSearchParams } from '../../../hooks/use_search_params'
import { api } from '~/lib/api'
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

export function ChronicLatenessTable() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    api.api.v1.analytics.attendance.lateChronic.queryOptions({
      query: {
        schoolId: params.schoolId,
        schoolChainId: params.schoolChainId,
      },
    })
  )

  return (
    <ChartContainer
      title="Atrasos Crônicos"
      description={`Alunos que chegaram atrasados em mais de ${data?.threshold || 20}% das aulas`}
      isLoading={isLoading}
      error={error instanceof Error ? error : undefined}
    >
      {data && data.students && data.students.length > 0 ? (
        <>
          <div className="mb-4 rounded-lg bg-orange-50 p-3 text-sm text-orange-800">
            <Clock className="mr-2 inline h-4 w-4" />
            {data.totalChronicLatenessStudents} aluno(s) com padrão recorrente de atrasos
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Escola</TableHead>
                <TableHead className="text-right">Total de Aulas</TableHead>
                <TableHead className="text-right">Atrasos</TableHead>
                <TableHead className="text-right">Taxa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.students.slice(0, 10).map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.schoolName}</TableCell>
                  <TableCell className="text-right">{student.totalRecords}</TableCell>
                  <TableCell className="text-right">{student.lateCount}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={student.latenessRate > 30 ? 'destructive' : 'secondary'}>
                      {student.latenessRate}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Nenhum aluno com padrão crônico de atrasos encontrado
        </div>
      )}
    </ChartContainer>
  )
}
