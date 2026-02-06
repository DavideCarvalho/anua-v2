import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Users } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Progress } from '~/components/ui/progress'
import { ErrorBoundary } from '~/components/error-boundary'
import { useAttendanceClassStudentsQueryOptions } from '~/hooks/queries/use_attendance_class_students'

interface AttendancesTableProps {
  classId: string
  academicPeriodId: string
  courseId: string
}

interface StudentAttendance {
  student: {
    id: string
    name: string
  }
  totalClasses: number
  presentCount: number
  absentCount: number
  lateCount: number
  justifiedCount: number
  attendancePercentage: number
}

function AttendancesTableSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

function AttendancesTableEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Users className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Nenhum aluno</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Não há alunos matriculados nesta turma.
      </p>
    </div>
  )
}

function getAttendanceBadgeVariant(percentage: number) {
  if (percentage >= 75) return 'default'
  if (percentage >= 50) return 'secondary'
  return 'destructive'
}

function AttendancesTableContent({ classId, academicPeriodId, courseId }: AttendancesTableProps) {
  const [page, setPage] = useState(1)

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery(useAttendanceClassStudentsQueryOptions({ classId, courseId, academicPeriodId, page }))

  if (isLoading) {
    return <AttendancesTableSkeleton />
  }

  if (isError || !response) {
    return (
      <div className="text-center text-destructive py-8">Erro ao carregar presenças</div>
    )
  }

  const attendances: StudentAttendance[] = response?.data ?? []
  const meta = response?.meta ?? null

  if (attendances.length === 0) {
    return <AttendancesTableEmpty />
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aluno</TableHead>
            <TableHead className="text-center">Presenças</TableHead>
            <TableHead className="text-center">Faltas</TableHead>
            <TableHead className="text-center">Atrasos</TableHead>
            <TableHead className="text-center">Justificado</TableHead>
            <TableHead className="text-center">Frequência</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendances.map((attendance) => (
            <TableRow key={attendance.student.id}>
              <TableCell className="font-medium">{attendance.student.name}</TableCell>
              <TableCell className="text-center">
                <Badge variant="default" className="bg-green-500">
                  {attendance.presentCount}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="destructive">
                  {attendance.absentCount}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary">
                  {attendance.lateCount}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">
                  {attendance.justifiedCount}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 justify-center">
                  <Progress
                    value={attendance.attendancePercentage}
                    className="w-16 h-2"
                  />
                  <Badge variant={getAttendanceBadgeVariant(attendance.attendancePercentage)}>
                    {attendance.attendancePercentage}%
                  </Badge>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {meta && meta.lastPage > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {meta.currentPage} de {meta.lastPage}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= meta.lastPage}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function AttendancesTable(props: AttendancesTableProps) {
  return (
    <ErrorBoundary>
      <AttendancesTableContent {...props} />
    </ErrorBoundary>
  )
}
