import { useQuery } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { useSearchParams } from '../../../hooks/use_search_params'
import { useChronicAbsenteeismQueryOptions } from '../../../hooks/queries/use_chronic_absenteeism'
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

export function ChronicAbsenteeismTable() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    useChronicAbsenteeismQueryOptions({
      schoolId: params.schoolId,
      schoolChainId: params.schoolChainId,
    })
  )

  return (
    <ChartContainer
      title="Absenteísmo Crônico"
      description={`Alunos com mais de ${data?.threshold || 20}% de faltas`}
      isLoading={isLoading}
      error={error}
    >
      {data && data.students && data.students.length > 0 ? (
        <>
          <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mr-2 inline h-4 w-4" />
            {data.totalChronicStudents} aluno(s) com absenteísmo crônico
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Escola</TableHead>
                <TableHead className="text-right">Total de Aulas</TableHead>
                <TableHead className="text-right">Faltas</TableHead>
                <TableHead className="text-right">Taxa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.students.slice(0, 10).map((student: any) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.schoolName}</TableCell>
                  <TableCell className="text-right">{student.totalRecords}</TableCell>
                  <TableCell className="text-right">{student.absentCount}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={student.absenceRate > 30 ? 'destructive' : 'secondary'}>
                      {student.absenceRate}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Nenhum aluno com absenteísmo crônico encontrado
        </div>
      )}
    </ChartContainer>
  )
}
