import { Fragment, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, CalendarOff, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
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
import { Skeleton } from '~/components/ui/skeleton'
import { ErrorBoundary } from '~/components/error-boundary'
import { cn } from '~/lib/utils'
import { api } from '~/lib/api'

import { AttendanceStatusEditor, normalizeStatus } from './attendance-status-editor'
import { SortableHead, type SortDir, type SortState } from './sortable-head'

const PAGE_SIZE = 30

type SortBy = 'date' | 'present' | 'absent' | 'late' | 'justified'

const DEFAULT_DIR: Record<SortBy, SortDir> = {
  date: 'desc',
  present: 'desc',
  absent: 'desc',
  late: 'desc',
  justified: 'desc',
}

interface LessonsTableProps {
  classId: string
  academicPeriodId: string
  subPeriodId?: string
  subPeriodIsLocked?: boolean
}

function LessonSkeletonRow() {
  return (
    <TableRow>
      <TableCell className="w-8">
        <Skeleton className="h-7 w-7 rounded-md" />
      </TableCell>
      <TableCell>
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-3 w-32" />
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
        <div className="flex justify-center">
          <Skeleton className="h-4 w-6" />
        </div>
      </TableCell>
    </TableRow>
  )
}

function LessonStudentsSkeleton() {
  return (
    <ol className="grid grid-cols-1 gap-1.5 py-2 sm:grid-cols-2" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-6 w-20" />
        </li>
      ))}
    </ol>
  )
}

function LessonStudents({
  attendanceId,
  classId,
  subPeriodIsLocked,
}: {
  attendanceId: string
  classId: string
  subPeriodIsLocked?: boolean
}) {
  const { data, isLoading, isError } = useQuery(
    api.api.v1.attendance.lessons.students.queryOptions({
      params: { id: attendanceId },
      query: { classId },
    })
  )

  if (isLoading) {
    return <LessonStudentsSkeleton />
  }

  if (isError || !data) {
    return <div className="py-3 text-xs text-destructive">Não foi possível carregar os alunos.</div>
  }

  const rows = data.data
  if (!rows || rows.length === 0) {
    return (
      <div className="py-3 text-xs text-muted-foreground">
        Sem alunos registrados nesta chamada.
      </div>
    )
  }

  return (
    <ol className="grid grid-cols-1 gap-1.5 py-2 sm:grid-cols-2">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-muted/40"
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium leading-tight">{row.studentName}</div>
            {row.justification && (
              <div className="truncate text-[11px] italic text-muted-foreground">
                “{row.justification}”
              </div>
            )}
          </div>
          <AttendanceStatusEditor
            studentHasAttendanceId={row.id}
            classId={classId}
            currentStatus={normalizeStatus(row.status)}
            currentJustification={row.justification}
            lastEdit={row.lastEdit}
            requiresReason={!!subPeriodIsLocked}
            size="sm"
          />
        </li>
      ))}
    </ol>
  )
}

function LessonsTableContent({
  classId,
  academicPeriodId,
  subPeriodId,
  subPeriodIsLocked,
}: LessonsTableProps) {
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [sort, setSortState] = useState<SortState<SortBy>>({ by: 'date', dir: 'desc' })

  function setSort(next: SortState<SortBy>) {
    setSortState(next)
    setPage(1)
  }

  const { data, isLoading, isFetching, isError } = useQuery(
    api.api.v1.attendance.lessons.index.queryOptions({
      query: {
        classId,
        academicPeriodId,
        subPeriodId: subPeriodId || undefined,
        page,
        limit: PAGE_SIZE,
        sortBy: sort.by,
        sortDir: sort.dir,
      },
    })
  )

  const lessons = data?.data ?? []
  const meta = data?.meta ?? null
  const total = meta?.total ?? 0
  const currentPage = meta?.currentPage ?? page
  const lastPage = meta?.lastPage ?? 1
  const showEmpty = !isLoading && !isError && lessons.length === 0
  const skeletonRows = Math.min(PAGE_SIZE, Math.max(total || PAGE_SIZE, 8))

  function toggle(attendanceId: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(attendanceId)) next.delete(attendanceId)
      else next.add(attendanceId)
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
                label="Aula"
                by="date"
                defaultDir={DEFAULT_DIR.date}
                sort={sort}
                onChange={setSort}
              />
            </TableHead>
            <TableHead className="text-center">
              <SortableHead
                label="Presentes"
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: skeletonRows }).map((_, i) => (
              <LessonSkeletonRow key={`sk-${i}`} />
            ))}

          {!isLoading && isError && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-6 w-6" />
                  Erro ao carregar aulas
                </div>
              </TableCell>
            </TableRow>
          )}

          {showEmpty && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <CalendarOff className="h-10 w-10" />
                  <h3 className="text-base font-semibold text-foreground">Nenhuma chamada</h3>
                  <p className="max-w-xs text-sm">
                    Quando você registrar a primeira presença desta turma, ela aparece aqui em ordem
                    cronológica.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            !isError &&
            lessons.map((lesson) => {
              const isExpanded = expanded.has(lesson.id)
              const date = lesson.date ? new Date(lesson.date) : null
              const subject = lesson.slot?.subject?.name ?? 'Aula'
              const teacher = lesson.slot?.teacher?.name

              return (
                <Fragment key={lesson.id}>
                  <TableRow
                    className={cn('cursor-pointer', isExpanded && 'bg-muted/30')}
                    onClick={() => toggle(lesson.id)}
                  >
                    <TableCell className="w-8">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggle(lesson.id)
                        }}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Recolher chamada' : 'Expandir chamada'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium leading-tight">
                          {date
                            ? format(date, "eee, dd 'de' MMMM 'às' HH:mm", {
                                locale: ptBR,
                              }).replace(/^./, (c) => c.toUpperCase())
                            : '—'}
                          <span className="text-muted-foreground"> · {subject}</span>
                        </div>
                        {teacher && (
                          <div className="text-[11px] text-muted-foreground">{teacher}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {lesson.counts.present}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {lesson.counts.absent > 0 ? (
                        <span className="text-rose-700 dark:text-rose-300">
                          {lesson.counts.absent}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {lesson.counts.late > 0 ? (
                        <span className="text-amber-700 dark:text-amber-300">
                          {lesson.counts.late}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {lesson.counts.excused > 0 ? (
                        <span>{lesson.counts.excused}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell />
                      <TableCell colSpan={5} className="bg-muted/20 py-2 pr-4">
                        <LessonStudents
                          attendanceId={lesson.id}
                          classId={classId}
                          subPeriodIsLocked={subPeriodIsLocked}
                        />
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                          {lesson.createdBy && (
                            <span>
                              Registro original: {lesson.createdBy.name}
                              {lesson.createdAt && (
                                <span>
                                  {' '}
                                  · {format(new Date(lesson.createdAt), "dd/MM 'às' HH:mm")}
                                </span>
                              )}
                            </span>
                          )}
                          {lesson.lastEditedBy && lesson.lastEditedAt && (
                            <span>
                              Última edição: {lesson.lastEditedBy.name} ·{' '}
                              {format(new Date(lesson.lastEditedAt), "dd/MM 'às' HH:mm")}
                            </span>
                          )}
                        </div>
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
              {total} aula{total === 1 ? '' : 's'}
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

export function LessonsTable(props: LessonsTableProps) {
  return (
    <ErrorBoundary>
      <LessonsTableContent {...props} />
    </ErrorBoundary>
  )
}
