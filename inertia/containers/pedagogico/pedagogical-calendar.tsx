import { useEffect, useMemo, useState } from 'react'
import { useRouter } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import {
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  parse,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  PartyPopper,
  Plus,
} from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { useQueryClient } from '@tanstack/react-query'
import { NewEventModal } from '~/containers/events/new-event-modal'
import { NewAssignmentModal } from '~/containers/turma/new-assignment-modal'
import { NewExamModal } from '~/containers/turma/new-exam-modal'
import { Calendar } from '~/components/calendar'
import type {
  IEvent as FullCalendarEvent,
  IUser as FullCalendarUser,
} from '~/components/interfaces'
import { api } from '~/lib/api'
import type { SharedProps } from '~/lib/types'
import { useAuthUser } from '~/stores/auth_store'

import './pedagogical-calendar.css'

type CalendarSourceType = 'EVENT' | 'ASSIGNMENT' | 'EXAM' | 'HOLIDAY' | 'WEEKEND_CLASS_DAY'

interface CalendarItem {
  sourceType: CalendarSourceType
  sourceId: string | null
  title: string
  description: string | null
  startAt: string
  endAt: string | null
  isAllDay: boolean
  readonly: boolean
  schoolId: string
  classId: string | null
  academicPeriodId: string | null
  teacherName?: string | null
  school?: { id: string; name: string } | null
  class?: { id: string; name: string } | null
  subject?: { id: string; name: string } | null
  teacher?: { id: string; user?: { id: string; name: string } | null } | null
  academicPeriod?: { id: string; name: string } | null
  meta: Record<string, unknown>
}

function getTypeBadge(type: CalendarSourceType) {
  if (type === 'ASSIGNMENT') return <Badge variant="secondary">Atividade</Badge>
  if (type === 'EXAM') return <Badge variant="destructive">Prova</Badge>
  if (type === 'EVENT') return <Badge>Evento</Badge>
  if (type === 'HOLIDAY') return <Badge variant="outline">Feriado</Badge>
  return <Badge variant="outline">Fim de semana letivo</Badge>
}

function getTypeOrder(type: CalendarSourceType) {
  if (type === 'HOLIDAY') return 0
  if (type === 'WEEKEND_CLASS_DAY') return 1
  if (type === 'EXAM') return 2
  if (type === 'ASSIGNMENT') return 3
  return 4
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: 'Rascunho',
    PUBLISHED: 'Publicada',
    ARCHIVED: 'Arquivada',
    SCHEDULED: 'Agendada',
    IN_PROGRESS: 'Em andamento',
    COMPLETED: 'Concluida',
    CANCELLED: 'Cancelada',
    POSTPONED: 'Adiada',
  }

  return labels[status] ?? status
}

function parseItemDate(dateValue: string, isAllDay: boolean) {
  if (!isAllDay) {
    return new Date(dateValue)
  }

  const match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) {
    return new Date(dateValue)
  }

  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])

  return new Date(year, month, day, 12, 0, 0, 0)
}

function itemDayKey(item: CalendarItem) {
  return format(parseItemDate(item.startAt, item.isAllDay), 'yyyy-MM-dd')
}

function getTypeFilterLabel(type: 'ALL' | CalendarSourceType) {
  const labels: Record<'ALL' | CalendarSourceType, string> = {
    ALL: 'Todos os tipos',
    ASSIGNMENT: 'Atividade',
    EXAM: 'Prova',
    EVENT: 'Evento',
    HOLIDAY: 'Feriado',
    WEEKEND_CLASS_DAY: 'Fim de semana letivo',
  }

  return labels[type]
}

function NewItemMenu({
  onCreateAssignment,
  onCreateExam,
  onCreateEvent,
}: {
  onCreateAssignment: () => void
  onCreateExam: () => void
  onCreateEvent: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button type="button">
          <Plus className="mr-2 h-4 w-4" />
          Novo item
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-48 p-1.5 gap-1 duration-0 data-open:animate-none data-closed:animate-none"
      >
        <Button
          type="button"
          variant="ghost"
          className="justify-start h-8"
          onClick={() => {
            setIsOpen(false)
            onCreateAssignment()
          }}
        >
          Nova atividade
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="justify-start h-8"
          onClick={() => {
            setIsOpen(false)
            onCreateExam()
          }}
        >
          Nova prova
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="justify-start h-8"
          onClick={() => {
            setIsOpen(false)
            onCreateEvent()
          }}
        >
          Novo evento
        </Button>
      </PopoverContent>
    </Popover>
  )
}

export function PedagogicalCalendar() {
  const router = useRouter()
  const user = useAuthUser()
  const page = usePage<SharedProps>()
  const { selectedSchoolIds } = page.props
  const queryClassId = useMemo(() => {
    const query = page.url.split('?')[1]
    if (!query) return ''
    return new URLSearchParams(query).get('classId') ?? ''
  }, [page.url])
  const selectedSchoolId = selectedSchoolIds?.[0] ?? ''
  const queryClient = useQueryClient()
  const [selectedClass, setSelectedClass] = useState<string>('ALL')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'list' | 'week' | 'month'>('week')
  const [typeFilter, setTypeFilter] = useState<'ALL' | CalendarSourceType>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [newEventOpen, setNewEventOpen] = useState(false)
  const [newAssignmentOpen, setNewAssignmentOpen] = useState(false)
  const [newExamOpen, setNewExamOpen] = useState(false)
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null)
  const [editingExamId, setEditingExamId] = useState<string | null>(null)
  const [dayActionDate, setDayActionDate] = useState<Date | null>(null)

  const { data: classesData } = useQuery(api.api.v1.classes.sidebar.queryOptions({}))
  const { data: levelsData } = useQuery(
    api.api.v1.levels.index.queryOptions({
      query: {
        limit: 200,
        ...(selectedSchoolId ? { schoolId: selectedSchoolId } : {}),
      },
    })
  )

  const classesWithLevel = useMemo(() => {
    const levelById = new Map((levelsData?.data ?? []).map((level) => [level.id, level.name]))
    const byId = new Map<string, { id: string; name: string; levelName: string | null }>()

    for (const classItem of classesData?.data ?? []) {
      if (byId.has(classItem.id)) {
        continue
      }

      const fallbackLevelName = classItem.level?.id
        ? (levelById.get(classItem.level.id) ?? null)
        : null

      byId.set(classItem.id, {
        id: classItem.id,
        name: classItem.name,
        levelName: classItem.level?.name ?? fallbackLevelName,
      })
    }

    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [classesData?.data, levelsData?.data])

  const selectedClassLabel = useMemo(() => {
    if (!selectedClass || selectedClass === 'ALL') return 'Todas as turmas'

    const classItem = classesWithLevel.find((item) => item.id === selectedClass)
    if (!classItem) return 'Todas as turmas'

    return classItem.levelName ? `${classItem.name} - ${classItem.levelName}` : classItem.name
  }, [classesWithLevel, selectedClass])

  useEffect(() => {
    if (queryClassId && selectedClass !== queryClassId) {
      setSelectedClass(queryClassId)
    }
  }, [queryClassId, selectedClass])

  const range = useMemo(() => {
    if (viewMode === 'month') {
      return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) }
    }

    return {
      start: startOfWeek(currentDate, { locale: ptBR }),
      end: endOfWeek(currentDate, { locale: ptBR }),
    }
  }, [currentDate, viewMode])

  const { data, isLoading } = useQuery(
    api.api.v1.pedagogicalCalendar.index.queryOptions({
      query: {
        startDate: range.start.toISOString(),
        endDate: range.end.toISOString(),
        ...(selectedClass !== 'ALL' ? { classId: selectedClass } : {}),
      },
    })
  )

  const items = data?.data ?? []

  const availableStatuses = useMemo<string[]>(() => {
    return Array.from(
      new Set(
        items.flatMap((item) => {
          const status = (item.meta as Record<string, unknown> | undefined)?.status
          return typeof status === 'string' ? [status] : []
        })
      )
    )
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (item.sourceType === 'WEEKEND_CLASS_DAY') {
        return true
      }

      if (typeFilter !== 'ALL' && item.sourceType !== typeFilter) {
        return false
      }

      if (statusFilter !== 'ALL') {
        return item.meta?.status === statusFilter
      }

      return true
    })
  }, [items, statusFilter, typeFilter])

  const groupedList = useMemo(() => {
    return filteredItems.reduce<Record<string, CalendarItem[]>>((acc, item) => {
      const dayKey = itemDayKey(item)
      if (!acc[dayKey]) acc[dayKey] = []
      acc[dayKey].push(item)
      return acc
    }, {})
  }, [filteredItems])

  const fullCalendarSystemUser = useMemo<FullCalendarUser>(
    () => ({
      id: 'pedagogical-calendar',
      name: 'Calendário Pedagógico',
      picturePath: null,
    }),
    []
  )

  const fullCalendarUsers = useMemo<FullCalendarUser[]>(() => {
    return [fullCalendarSystemUser]
  }, [fullCalendarSystemUser])

  const fullCalendarEvents = useMemo<FullCalendarEvent[]>(() => {
    const colorByType: Record<CalendarSourceType, FullCalendarEvent['color']> = {
      ASSIGNMENT: 'blue',
      EXAM: 'red',
      EVENT: 'green',
      HOLIDAY: 'orange',
      WEEKEND_CLASS_DAY: 'yellow',
    }

    return filteredItems
      .map((item, index) => {
        const startDate = parseItemDate(item.startAt, item.isAllDay)
        const endDate = item.endAt ? parseItemDate(item.endAt, item.isAllDay) : startDate

        return {
          id: index + 1,
          title: item.sourceType === 'HOLIDAY' ? 'Feriado' : item.title,
          description: item.description ?? '',
          color: colorByType[item.sourceType],
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          sourceType: item.sourceType,
          sourceId: item.sourceId,
          readonly: item.readonly,
          user:
            item.sourceType === 'ASSIGNMENT' || item.sourceType === 'EXAM'
              ? {
                  id: item.teacher?.id ?? 'pedagogical-calendar',
                  name: item.teacherName ?? 'Professor não informado',
                  picturePath: null,
                }
              : fullCalendarSystemUser,
        }
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }, [filteredItems, fullCalendarSystemUser])

  const selectedClassForCreation = selectedClass === 'ALL' ? '' : selectedClass

  const handleEmptyDayAction = (date: Date, action: 'assignment' | 'exam' | 'event') => {
    setDayActionDate(date)

    if (action === 'assignment') {
      setNewAssignmentOpen(true)
      return
    }

    if (action === 'exam') {
      setNewExamOpen(true)
      return
    }

    setNewEventOpen(true)
  }

  const handleEditItem = (item: CalendarItem) => {
    if (item.readonly || !item.sourceId) {
      return
    }

    if (item.sourceType === 'ASSIGNMENT') {
      setEditingAssignmentId(item.sourceId)
      return
    }

    if (item.sourceType === 'EXAM') {
      setEditingExamId(item.sourceId)
      return
    }

    if (item.sourceType === 'EVENT') {
      router.visit({ route: 'web.escola.eventos.editar', routeParams: { eventId: item.sourceId } })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Calendário Pedagógico</h2>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Select
            value={selectedClass}
            onValueChange={(value, _event) => {
              if (value) setSelectedClass(value)
            }}
          >
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Todas as turmas">{selectedClassLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as turmas</SelectItem>
              {classesWithLevel.map((classItem) => (
                <SelectItem key={classItem.id} value={classItem.id}>
                  {classItem.levelName
                    ? `${classItem.name} - ${classItem.levelName}`
                    : classItem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as typeof viewMode)}>
            <TabsList>
              <TabsTrigger value="list">Lista</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
            </TabsList>
          </Tabs>

          <NewItemMenu
            onCreateAssignment={() => setNewAssignmentOpen(true)}
            onCreateExam={() => setNewExamOpen(true)}
            onCreateEvent={() => setNewEventOpen(true)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <Select
          value={typeFilter}
          onValueChange={(value, _event) => {
            if (value) setTypeFilter(value as 'ALL' | CalendarSourceType)
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Tipo">{getTypeFilterLabel(typeFilter)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os tipos</SelectItem>
            <SelectItem value="ASSIGNMENT">Atividade</SelectItem>
            <SelectItem value="EXAM">Prova</SelectItem>
            <SelectItem value="EVENT">Evento</SelectItem>
            <SelectItem value="HOLIDAY">Feriado</SelectItem>
            <SelectItem value="WEEKEND_CLASS_DAY">Fim de semana letivo</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value, _event) => {
            if (value) setStatusFilter(value)
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Status">
              {statusFilter === 'ALL' ? 'Todos os status' : getStatusLabel(statusFilter)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os status</SelectItem>
            {availableStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-3">
          {isLoading ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Carregando calendário pedagógico...
              </CardContent>
            </Card>
          ) : null}

          {Object.entries(groupedList).map(([day, dayItems]) => (
            <Card key={day}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {format(parse(day, 'yyyy-MM-dd', new Date()), "EEEE, dd 'de' MMMM", {
                    locale: ptBR,
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[...dayItems]
                  .sort((a, b) => getTypeOrder(a.sourceType) - getTypeOrder(b.sourceType))
                  .map((item) => (
                    <div
                      key={`${item.sourceType}:${item.sourceId ?? item.startAt}`}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {item.sourceType === 'ASSIGNMENT' ? (
                            <FileText className="h-4 w-4" />
                          ) : null}
                          {item.sourceType === 'EXAM' ? (
                            <ClipboardList className="h-4 w-4" />
                          ) : null}
                          {item.sourceType === 'EVENT' ? <PartyPopper className="h-4 w-4" /> : null}
                          <span className="font-medium">{item.title}</span>
                          {getTypeBadge(item.sourceType)}
                          {typeof item.meta?.status === 'string' ? (
                            <Badge variant="outline">{getStatusLabel(item.meta.status)}</Badge>
                          ) : null}
                        </div>
                        {item.description ? (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      {item.readonly ? (
                        <span className="text-xs text-muted-foreground">
                          Ajuste no calendário do período letivo
                        </span>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                          Editar
                        </Button>
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}

          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Nenhum item no período selecionado.
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

      {viewMode === 'week' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium capitalize">
              {`${format(startOfWeek(currentDate, { locale: ptBR }), "dd 'de' MMM", { locale: ptBR })} - ${format(endOfWeek(currentDate, { locale: ptBR }), "dd 'de' MMM", { locale: ptBR })}`}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date()
                  setCurrentDate(now)
                }}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate((prev) => addWeeks(prev, -1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate((prev) => addWeeks(prev, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="pedagogical-full-calendar rounded-xl border bg-card">
            <Calendar
              events={fullCalendarEvents}
              users={fullCalendarUsers}
              initialView="week"
              selectedDate={currentDate}
              isLoading={isLoading}
              showHeader={false}
              emptyDayActionLabel="Novo item"
              onEmptyDayAction={handleEmptyDayAction}
            />
          </div>
        </div>
      ) : null}

      {viewMode === 'month' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium capitalize">
              {currentDate.toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date()
                  setCurrentDate(now)
                }}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setCurrentDate((prev) => addMonths(prev, -1))
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setCurrentDate((prev) => addMonths(prev, 1))
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="pedagogical-full-calendar rounded-xl border bg-card">
            <Calendar
              events={fullCalendarEvents}
              users={fullCalendarUsers}
              initialView="month"
              selectedDate={currentDate}
              isLoading={isLoading}
              showHeader={false}
              emptyDayActionLabel="Novo item"
              onEmptyDayAction={handleEmptyDayAction}
            />
          </div>
        </div>
      ) : null}

      <NewAssignmentModal
        classId={selectedClassForCreation}
        academicPeriodId=""
        open={newAssignmentOpen}
        defaultDate={dayActionDate ?? undefined}
        onOpenChange={(open) => {
          setNewAssignmentOpen(open)
          if (!open) {
            setDayActionDate(null)
            queryClient.invalidateQueries({
              queryKey: api.api.v1.pedagogicalCalendar.index.pathKey(),
            })
          }
        }}
        user={user}
      />

      <NewExamModal
        classId={selectedClassForCreation}
        academicPeriodId=""
        open={newExamOpen}
        defaultDate={dayActionDate ?? undefined}
        onOpenChange={(open) => {
          setNewExamOpen(open)
          if (!open) {
            setDayActionDate(null)
            queryClient.invalidateQueries({
              queryKey: api.api.v1.pedagogicalCalendar.index.pathKey(),
            })
          }
        }}
        user={user}
      />

      <NewEventModal
        open={newEventOpen}
        defaultDate={dayActionDate ?? undefined}
        onOpenChange={(open) => {
          setNewEventOpen(open)
          if (!open) {
            setDayActionDate(null)
            queryClient.invalidateQueries({
              queryKey: api.api.v1.pedagogicalCalendar.index.pathKey(),
            })
          }
        }}
        schoolId={selectedSchoolId}
      />

      {editingAssignmentId ? (
        <NewAssignmentModal
          classId=""
          academicPeriodId=""
          open={!!editingAssignmentId}
          assignmentId={editingAssignmentId}
          mode="edit"
          onOpenChange={(open) => {
            if (!open) {
              setEditingAssignmentId(null)
              queryClient.invalidateQueries({ queryKey: api.api.v1.assignments.index.pathKey() })
              queryClient.invalidateQueries({
                queryKey: api.api.v1.pedagogicalCalendar.index.pathKey(),
              })
            }
          }}
          user={user}
        />
      ) : null}

      {editingExamId ? (
        <NewExamModal
          classId=""
          academicPeriodId=""
          open={!!editingExamId}
          examId={editingExamId}
          mode="edit"
          onOpenChange={(open) => {
            if (!open) {
              setEditingExamId(null)
              queryClient.invalidateQueries({ queryKey: api.api.v1.exams.index.pathKey() })
              queryClient.invalidateQueries({
                queryKey: api.api.v1.pedagogicalCalendar.index.pathKey(),
              })
            }
          }}
          user={user}
        />
      ) : null}
    </div>
  )
}
