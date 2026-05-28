import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import type { Route } from '@tuyau/core/types'
import { cn } from '../../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

import { api } from '~/lib/api'

type StudentAttendanceResponse = Route.Response<'api.v1.responsavel.api.student_attendance'>
type AttendanceRecord = StudentAttendanceResponse['data'][number]

const CONSECUTIVE_ABSENCE_THRESHOLD = 3

function findConsecutiveAbsenceIds(records: AttendanceRecord[]): Set<string> {
  const flagged = new Set<string>()
  const sorted = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  let runStart = 0
  for (let i = 0; i <= sorted.length; i += 1) {
    const isAbsent = i < sorted.length && sorted[i].status === 'ABSENT'
    if (!isAbsent) {
      const runLength = i - runStart
      if (runLength >= CONSECUTIVE_ABSENCE_THRESHOLD) {
        for (let j = runStart; j < i; j += 1) {
          flagged.add(sorted[j].id)
        }
      }
      runStart = i + 1
    }
  }
  return flagged
}

interface StudentAttendanceContainerProps {
  studentId: string
  studentName: string
  subPeriodId?: string
}

export function StudentAttendanceContainer({
  studentId,
  studentName,
  subPeriodId,
}: StudentAttendanceContainerProps) {
  const { data, isLoading, error, isError } = useQuery(
    api.api.v1.responsavel.api.studentAttendance.queryOptions({
      params: { studentId },
      query: subPeriodId ? { subPeriodId } : undefined,
    })
  )

  const consecutiveAbsenceIds = useMemo(
    () => findConsecutiveAbsenceIds(data?.data ?? []),
    [data?.data]
  )

  if (isLoading) {
    return <StudentAttendanceContainerSkeleton />
  }

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-12 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">Erro ao carregar frequência</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Ocorreu um erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return <StudentAttendanceContainerSkeleton />
  }

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

  const hasConsecutiveAbsences = consecutiveAbsenceIds.size > 0

  return (
    <div className="space-y-6">
      {hasConsecutiveAbsences && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg ring-1 ring-red-600/20 bg-red-500/10 p-4 text-red-700 dark:text-red-400"
        >
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Atenção: padrão de faltas detectado</p>
            <p className="mt-0.5 text-red-700/80 dark:text-red-400/80">
              {studentName} teve {CONSECUTIVE_ABSENCE_THRESHOLD} ou mais faltas consecutivas.
              Verifique o histórico abaixo.
            </p>
          </div>
        </div>
      )}

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
              <p
                className={cn(
                  'text-3xl font-bold',
                  getAttendanceColor(data.summary.attendanceRate)
                )}
              >
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
              <p className="text-3xl font-bold text-blue-600">{data.summary.excusedCount}</p>
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
                {data.data.map((attendance: AttendanceRecord) => {
                  const isInAbsenceRun = consecutiveAbsenceIds.has(attendance.id)
                  return (
                    <TableRow
                      key={attendance.id}
                      className={cn(isInAbsenceRun && 'bg-red-500/5 hover:bg-red-500/10')}
                    >
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
                        {attendance.justification || '-'}
                      </TableCell>
                    </TableRow>
                  )
                })}
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
