import { Fragment, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, ChevronDown, ChevronRight, Loader2, Users } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Progress } from '~/components/ui/progress'
import { Skeleton } from '~/components/ui/skeleton'
import { ErrorBoundary } from '~/components/error-boundary'
import { cn } from '~/lib/utils'
import { api } from '~/lib/api'

import { SortableHead, type SortDir, type SortState } from './sortable-head'

const PAGE_SIZE = 20

import {
  AttendanceStatusEditor,
  normalizeStatus,
  type StatusValue,
} from './attendance-status-editor'

interface AttendancesTableProps {
  classId: string
  academicPeriodId: string
  courseId: string
  subPeriodId?: string
  subPeriodIsLocked?: boolean
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

function getFrequencyTone(percentage: number) {
  if (percentage >= 75) return 'text-emerald-700 dark:text-emerald-300'
  if (percentage >= 50) return 'text-amber-700 dark:text-amber-300'
  return 'text-rose-700 dark:text-rose-300'
}

function StudentHistory({
  studentId,
  classId,
  academicPeriodId,
  subPeriodId,
  subPeriodIsLocked,
}: {
  studentId: string
  classId: string
  academicPeriodId: string
  subPeriodId?: string
  subPeriodIsLocked?: boolean
}) {
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching, isError } = useQuery(
    api.api.v1.attendance.student.history.queryOptions({
      params: { studentId },
      query: {
        classId,
        academicPeriodId,
        subPeriodId: subPeriodId || undefined,
        page,
        limit: 30,
      },
    })
  )

  if (isLoading) {
    return (
      <ol className="space-y-1.5 py-2" aria-busy="true" aria-label="Carregando histórico">
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md px-1.5 py-1.5"
          >
            <Skeleton className="h-3 w-32" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-40" />
            </div>
            <Skeleton className="h-6 w-20" />
          </li>
        ))}
      </ol>
    )
  }

  if (isError || !data) {
    return (
      <div className="py-3 text-xs text-destructive">Não foi possível carregar o histórico.</div>
    )
  }

  const records = data.data
  if (!records || records.length === 0) {
    return (
      <div className="py-3 text-xs text-muted-foreground">Sem chamadas registradas no período.</div>
    )
  }

  return (
    <div className="space-y-2 py-2">
      <ol className="space-y-1.5">
        {records.map((record) => {
          const date = record.attendance.date ? new Date(record.attendance.date) : null
          const subject = record.attendance.slot?.subject?.name ?? 'Aula'
          const teacher = record.attendance.slot?.teacher?.name

          return (
            <li
              key={record.id}
              className="grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-md px-1.5 py-1.5 hover:bg-muted/40"
            >
              <div className="text-xs tabular-nums text-muted-foreground">
                {date
                  ? format(date, "dd/MM eee 'às' HH:mm", { locale: ptBR }).replace(/^./, (c) =>
                      c.toUpperCase()
                    )
                  : '—'}
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-medium leading-tight">{subject}</div>
                {teacher && <div className="text-[11px] text-muted-foreground">{teacher}</div>}
                {record.justification && (
                  <div className="text-[11px] italic text-muted-foreground">
                    “{record.justification}”
                  </div>
                )}
              </div>
              <AttendanceStatusEditor
                studentHasAttendanceId={record.id}
                classId={classId}
                currentStatus={normalizeStatus(record.status)}
                currentJustification={record.justification}
                lastEdit={record.lastEdit}
                requiresReason={!!subPeriodIsLocked}
                size="sm"
              />
            </li>
          )
        })}
      </ol>

      {data.meta && (
        <div className="flex h-6 items-center justify-between border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
          <span className="tabular-nums">
            {data.meta.total} chamada{data.meta.total === 1 ? '' : 's'}
            {isFetching && (
              <Loader2 className="ml-1.5 inline h-2.5 w-2.5 animate-spin text-muted-foreground/60" />
            )}
          </span>
          {data.meta.lastPage > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="tabular-nums">
                Página {data.meta.currentPage} de {data.meta.lastPage}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.meta.lastPage}
              >
                Próximo
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

type SortBy = 'name' | 'present' | 'absent' | 'late' | 'justified' | 'percentage'

// Default direction per column: nome alfabético sobe; contadores numéricos
// começam descendentes (faz mais sentido perguntar "quem tem MAIS faltas").
const DEFAULT_DIR: Record<SortBy, SortDir> = {
  name: 'asc',
  present: 'desc',
  absent: 'desc',
  late: 'desc',
  justified: 'desc',
  percentage: 'asc',
}

function SkeletonRow() {
  // Altura compatível com uma linha real pra evitar layout shift quando os
  // dados chegam. Largura variada nos placeholders quebra a sensação de
  // "barras idênticas" e fica mais próximo do conteúdo real.
  return (
    <TableRow>
      <TableCell className="w-8">
        <Skeleton className="h-7 w-7 rounded-md" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell>
        <div className="flex justify-center">
          <Skeleton className="h-4 w-6" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex justify-center">
          <Skeleton className="h-4 w-6" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex justify-center">
          <Skeleton className="h-4 w-6" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex justify-center">
          <Skeleton className="h-4 w-6" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="h-1.5 w-20" />
          <Skeleton className="h-3 w-8" />
        </div>
      </TableCell>
    </TableRow>
  )
}

function EmptyRow({ message }: { message: React.ReactNode }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={7} className="py-12 text-center">
        {message}
      </TableCell>
    </TableRow>
  )
}

function AttendancesTableContent({
  classId,
  academicPeriodId,
  courseId,
  subPeriodId,
  subPeriodIsLocked,
}: AttendancesTableProps) {
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [sort, setSortState] = useState<SortState<SortBy>>({ by: 'name', dir: 'asc' })

  function setSort(next: SortState<SortBy>) {
    setSortState(next)
    setPage(1)
  }

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
  } = useQuery(
    api.api.v1.attendance.classStudents.queryOptions({
      params: { classId },
      query: {
        academicPeriodId,
        courseId,
        page,
        limit: PAGE_SIZE,
        subPeriodId: subPeriodId || undefined,
        sortBy: sort.by,
        sortDir: sort.dir,
      },
    })
  )

  const attendances: StudentAttendance[] = response?.data ?? []
  const meta = response?.meta ?? null
  const total = meta?.total ?? 0
  const currentPage = meta?.currentPage ?? page
  const lastPage = meta?.lastPage ?? 1
  const showEmpty = !isLoading && !isError && attendances.length === 0
  const skeletonRows = Math.min(PAGE_SIZE, Math.max(total || PAGE_SIZE, 8))

  function toggle(studentId: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>
              <SortableHead
                label="Aluno"
                by="name"
                defaultDir={DEFAULT_DIR.name}
                sort={sort}
                onChange={setSort}
              />
            </TableHead>
            <TableHead className="text-center">
              <SortableHead
                label="Presenças"
                by="present"
                defaultDir={DEFAULT_DIR.present}
                sort={sort}
                onChange={setSort}
                align="center"
              />
            </TableHead>
            <TableHead className="text-center">
              <SortableHead
                label="Faltas"
                by="absent"
                defaultDir={DEFAULT_DIR.absent}
                sort={sort}
                onChange={setSort}
                align="center"
              />
            </TableHead>
            <TableHead className="text-center">
              <SortableHead
                label="Atrasos"
                by="late"
                defaultDir={DEFAULT_DIR.late}
                sort={sort}
                onChange={setSort}
                align="center"
              />
            </TableHead>
            <TableHead className="text-center">
              <SortableHead
                label="Justificadas"
                by="justified"
                defaultDir={DEFAULT_DIR.justified}
                sort={sort}
                onChange={setSort}
                align="center"
              />
            </TableHead>
            <TableHead className="text-center">
              <SortableHead
                label="Frequência"
                by="percentage"
                defaultDir={DEFAULT_DIR.percentage}
                sort={sort}
                onChange={setSort}
                align="center"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: skeletonRows }).map((_, i) => <SkeletonRow key={`sk-${i}`} />)}

          {!isLoading && isError && (
            <EmptyRow
              message={
                <div className="flex flex-col items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-6 w-6" />
                  Erro ao carregar presenças
                </div>
              }
            />
          )}

          {showEmpty && (
            <EmptyRow
              message={
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Users className="h-10 w-10" />
                  <h3 className="text-base font-semibold text-foreground">Nenhum aluno</h3>
                  <p className="text-sm">Não há alunos matriculados nesta turma.</p>
                </div>
              }
            />
          )}

          {!isLoading &&
            !isError &&
            attendances.map((attendance) => {
              const isExpanded = expanded.has(attendance.student.id)
              return (
                <Fragment key={attendance.student.id}>
                  <TableRow
                    className={cn('cursor-pointer', isExpanded && 'bg-muted/30')}
                    onClick={() => toggle(attendance.student.id)}
                  >
                    <TableCell className="w-8">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggle(attendance.student.id)
                        }}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Recolher histórico' : 'Expandir histórico'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{attendance.student.name}</TableCell>
                    <TableCell className="text-center tabular-nums">
                      {attendance.presentCount}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {attendance.absentCount > 0 ? (
                        <span className="text-rose-700 dark:text-rose-300">
                          {attendance.absentCount}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {attendance.lateCount > 0 ? (
                        <span className="text-amber-700 dark:text-amber-300">
                          {attendance.lateCount}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {attendance.justifiedCount > 0 ? (
                        <span>{attendance.justifiedCount}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={attendance.attendancePercentage} className="h-1.5 w-20" />
                        <span
                          className={cn(
                            'tabular-nums text-xs font-medium',
                            getFrequencyTone(attendance.attendancePercentage)
                          )}
                        >
                          {attendance.attendancePercentage}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell />
                      <TableCell colSpan={6} className="bg-muted/20 py-2 pr-4">
                        <StudentHistory
                          studentId={attendance.student.id}
                          classId={classId}
                          academicPeriodId={academicPeriodId}
                          subPeriodId={subPeriodId}
                          subPeriodIsLocked={subPeriodIsLocked}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              )
            })}
        </TableBody>
      </Table>

      <div className="flex h-8 items-center justify-between text-xs text-muted-foreground">
        <span className="tabular-nums">
          {isLoading ? (
            <Skeleton className="h-3 w-32" />
          ) : total > 0 ? (
            <>
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, total)} de{' '}
              {total} aluno{total === 1 ? '' : 's'}
              {isFetching && !isLoading && (
                <Loader2 className="ml-2 inline h-3 w-3 animate-spin text-muted-foreground/60" />
              )}
            </>
          ) : (
            <span aria-hidden>&nbsp;</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <span className="tabular-nums">
            {lastPage > 1 ? `Página ${currentPage} de ${lastPage}` : ''}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={isLoading || currentPage <= 1}
            aria-label="Página anterior"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setPage((p) => p + 1)}
            disabled={isLoading || currentPage >= lastPage}
            aria-label="Próxima página"
          >
            Próximo
          </Button>
        </div>
      </div>
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

// Re-export para componentes externos que precisam do tipo:
export type { StatusValue }
