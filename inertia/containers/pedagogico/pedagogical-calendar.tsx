import type { View } from 'react-big-calendar'
import { useMemo, useState } from 'react'
import { useRouter } from '@adonisjs/inertia/react'
import { useQuery } from '@tanstack/react-query'
import { endOfMonth, endOfWeek, format, getDay, parse, startOfMonth, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, ClipboardList, FileText, PartyPopper, Plus } from 'lucide-react'
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
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
import { useAuthUser } from '~/stores/auth_store'

import 'react-big-calendar/lib/css/react-big-calendar.css'

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
  meta: Record<string, unknown>
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  resource: CalendarItem
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'pt-BR': ptBR },
})

const messages = {
  allDay: 'Dia inteiro',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Item',
  noEventsInRange: 'Não há itens neste período.',
  showMore: (total: number) => `+ Ver mais (${total})`,
}

interface PedagogicalCalendarProps {
  schoolId: string
  classes: Array<{ id: string; name: string }>
}

function getTypeBadge(type: CalendarSourceType) {
  if (type === 'ASSIGNMENT') return <Badge variant="secondary">Atividade</Badge>
  if (type === 'EXAM') return <Badge variant="destructive">Prova</Badge>
  if (type === 'EVENT') return <Badge>Evento</Badge>
  if (type === 'HOLIDAY') return <Badge variant="outline">Feriado</Badge>
  return <Badge variant="outline">Fim de semana letivo</Badge>
}

function getTypeColor(type: CalendarSourceType) {
  if (type === 'ASSIGNMENT') return 'bg-blue-500'
  if (type === 'EXAM') return 'bg-red-500'
  if (type === 'EVENT') return 'bg-green-500'
  if (type === 'HOLIDAY') return 'bg-gray-500'
  return 'bg-amber-500'
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

export function PedagogicalCalendar({ schoolId, classes }: PedagogicalCalendarProps) {
  const router = useRouter()
  const user = useAuthUser()
  const queryClient = useQueryClient()
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id ?? '')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'list' | 'week' | 'month'>('week')
  const [typeFilter, setTypeFilter] = useState<'ALL' | CalendarSourceType>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [newEventOpen, setNewEventOpen] = useState(false)
  const [newAssignmentOpen, setNewAssignmentOpen] = useState(false)
  const [newExamOpen, setNewExamOpen] = useState(false)

  const range = useMemo(() => {
    if (viewMode === 'month') {
      return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) }
    }

    return {
      start: startOfWeek(currentDate, { locale: ptBR }),
      end: endOfWeek(currentDate, { locale: ptBR }),
    }
  }, [currentDate, viewMode])

  const { data, isLoading } = useQuery({
    queryKey: [
      'pedagogical-calendar',
      selectedClass,
      range.start.toISOString(),
      range.end.toISOString(),
    ],
    enabled: !!selectedClass,
    queryFn: async (): Promise<{ data: CalendarItem[] }> => {
      const params = new URLSearchParams({
        classId: selectedClass,
        startDate: range.start.toISOString(),
        endDate: range.end.toISOString(),
      })

      const response = await fetch(`/api/v1/pedagogical-calendar?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Não foi possível carregar o calendário pedagógico')
      }
      return response.json()
    },
  })

  const items = data?.data ?? []

  const availableStatuses = useMemo(() => {
    return Array.from(
      new Set(
        items
          .map((item) => (typeof item.meta?.status === 'string' ? item.meta.status : null))
          .filter((status): status is string => Boolean(status))
      )
    )
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== 'ALL' && item.sourceType !== typeFilter) {
        return false
      }

      if (statusFilter !== 'ALL') {
        return item.meta?.status === statusFilter
      }

      return true
    })
  }, [items, statusFilter, typeFilter])

  const events: CalendarEvent[] = useMemo(
    () =>
      filteredItems.map((item) => ({
        id: `${item.sourceType}:${item.sourceId ?? item.startAt}`,
        title: item.title,
        start: new Date(item.startAt),
        end: item.endAt ? new Date(item.endAt) : new Date(item.startAt),
        allDay: item.isAllDay,
        resource: item,
      })),
    [filteredItems]
  )

  const groupedList = useMemo(() => {
    return filteredItems.reduce<Record<string, CalendarItem[]>>((acc, item) => {
      const dayKey = format(new Date(item.startAt), 'yyyy-MM-dd')
      if (!acc[dayKey]) acc[dayKey] = []
      acc[dayKey].push(item)
      return acc
    }, {})
  }, [filteredItems])

  const handleEditItem = (item: CalendarItem) => {
    if (item.readonly || !item.sourceId) {
      return
    }

    if (item.sourceType === 'ASSIGNMENT') {
      router.visit({
        route: 'web.escola.pedagogico.atividades.edit',
        routeParams: { id: item.sourceId },
      })
      return
    }

    if (item.sourceType === 'EXAM') {
      router.visit({
        route: 'web.escola.pedagogico.provas.edit',
        routeParams: { id: item.sourceId },
      })
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
            value={selectedClass || 'none'}
            onValueChange={(value, _event) => {
              if (value && value !== 'none') setSelectedClass(value)
            }}
          >
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Selecione a turma" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((classItem) => (
                <SelectItem key={classItem.id} value={classItem.id}>
                  {classItem.name}
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo item
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setNewAssignmentOpen(true)}>
                Nova Atividade
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setNewExamOpen(true)}>Nova Prova</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setNewEventOpen(true)}>Novo Evento</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            <SelectValue placeholder="Tipo" />
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
            <SelectValue placeholder="Status" />
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

      {isLoading ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Carregando calendário pedagógico...
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && viewMode === 'list' ? (
        <div className="space-y-3">
          {Object.entries(groupedList).map(([day, dayItems]) => (
            <Card key={day}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {format(new Date(day), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayItems.map((item) => (
                  <div
                    key={`${item.sourceType}:${item.sourceId ?? item.startAt}`}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {item.sourceType === 'ASSIGNMENT' ? <FileText className="h-4 w-4" /> : null}
                        {item.sourceType === 'EXAM' ? <ClipboardList className="h-4 w-4" /> : null}
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

      {!isLoading && (viewMode === 'week' || viewMode === 'month') ? (
        <div className="h-[700px]">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            culture="pt-BR"
            messages={messages}
            view={viewMode as View}
            views={['week', 'month']}
            onNavigate={setCurrentDate}
            date={currentDate}
            eventPropGetter={(event) => ({
              className: `${getTypeColor(event.resource.sourceType)} text-white border-0 rounded px-1`,
            })}
          />
        </div>
      ) : null}

      <NewAssignmentModal
        classId={selectedClass}
        academicPeriodId=""
        open={newAssignmentOpen}
        onOpenChange={(open) => {
          setNewAssignmentOpen(open)
          if (!open) {
            queryClient.invalidateQueries({ queryKey: ['pedagogical-calendar'] })
          }
        }}
        user={user}
      />

      <NewExamModal
        classId={selectedClass}
        academicPeriodId=""
        open={newExamOpen}
        onOpenChange={(open) => {
          setNewExamOpen(open)
          if (!open) {
            queryClient.invalidateQueries({ queryKey: ['pedagogical-calendar'] })
          }
        }}
        user={user}
      />

      <NewEventModal
        open={newEventOpen}
        onOpenChange={(open) => {
          setNewEventOpen(open)
          if (!open) {
            queryClient.invalidateQueries({ queryKey: ['pedagogical-calendar'] })
          }
        }}
        schoolId={schoolId}
      />
    </div>
  )
}
