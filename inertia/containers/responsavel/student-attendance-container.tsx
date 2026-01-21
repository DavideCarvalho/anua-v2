import { useSuspenseQuery } from '@tanstack/react-query'
import { Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { cn } from '../../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

import { useStudentAttendanceQueryOptions } from '../../hooks/queries/use-student-attendance'

interface StudentAttendanceContainerProps {
  studentId: string
  studentName: string
}

export function StudentAttendanceContainer({
  studentId,
  studentName,
}: StudentAttendanceContainerProps) {
  const { data } = useSuspenseQuery(useStudentAttendanceQueryOptions({ studentId }))

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'ABSENT':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'LATE':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'JUSTIFIED':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'Presente'
      case 'ABSENT':
        return 'Ausente'
      case 'LATE':
        return 'Atrasado'
      case 'JUSTIFIED':
        return 'Justificado'
      default:
        return status
    }
  }

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Resumo de Frequencia - {studentName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className={cn('text-3xl font-bold', getAttendanceColor(data.summary.attendanceRate))}>
                {data.summary.attendanceRate}%
              </p>
              <p className="text-sm text-muted-foreground">Frequencia</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold text-green-600">{data.summary.presentCount}</p>
              <p className="text-sm text-muted-foreground">Presencas</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold text-red-600">{data.summary.absentCount}</p>
              <p className="text-sm text-muted-foreground">Faltas</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">{data.summary.lateCount}</p>
              <p className="text-sm text-muted-foreground">Atrasos</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{data.summary.justifiedCount}</p>
              <p className="text-sm text-muted-foreground">Justificadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Historico de Frequencia</CardTitle>
          <CardDescription>Registro de presencas e faltas</CardDescription>
        </CardHeader>
        <CardContent>
          {data.data.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhum registro de frequencia encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Observacao</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((attendance: any) => (
                  <TableRow key={attendance.id}>
                    <TableCell>
                      {format(new Date(attendance.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{attendance.subject || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {getStatusIcon(attendance.status)}
                        <span>{getStatusText(attendance.status)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {attendance.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function StudentAttendanceContainerSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-6 w-64 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
