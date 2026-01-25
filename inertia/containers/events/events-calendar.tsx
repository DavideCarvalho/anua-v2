import type { View } from 'react-big-calendar'
import { useCallback, useMemo, useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  parse,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, ShieldAlert } from 'lucide-react'
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar'

import { useEventsQueryOptions } from '../../hooks/queries/use_events'
import { EditEventModal } from './edit-event-modal'

import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar.css'

// API Event type - based on controller response
interface APIEvent {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  visibility: string
  priority: string
  startsAt: string
  endsAt: string | null
  startTime: string | null
  endTime: string | null
  isAllDay: boolean
  location: string | null
  isOnline: boolean
  isExternal: boolean
  requiresParentalConsent: boolean
}

// Calendar event type
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: APIEvent
}

// Configurar localização do calendário
const locales = {
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// Mensagens em português
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
  event: 'Evento',
  noEventsInRange: 'Não há eventos neste período.',
  showMore: (total: number) => `+ Ver mais (${total})`,
}

// Custom Event Component
interface EventComponentProps {
  event: CalendarEvent
}

function CustomEvent({ event }: EventComponentProps) {
  const requiresConsent = event.resource.requiresParentalConsent

  return (
    <div className="flex items-center justify-between gap-1 text-xs">
      <span className="truncate">{event.title}</span>
      {requiresConsent && (
        <div title="Requer Autorização Parental">
          <ShieldAlert className="h-3 w-3 flex-shrink-0" />
        </div>
      )}
    </div>
  )
}

interface EventsCalendarProps {
  schoolId?: string
}

export function EventsCalendar({ schoolId }: EventsCalendarProps) {
  const [editEventId, setEditEventId] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<View>('month')

  // Calcular range baseado na view
  const dateRange = useMemo(() => {
    if (view === 'month') {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      return { start: monthStart, end: monthEnd }
    }
    if (view === 'week') {
      const weekStart = startOfWeek(currentDate, { locale: ptBR })
      const weekEnd = endOfWeek(currentDate, { locale: ptBR })
      return { start: weekStart, end: weekEnd }
    }
    // day view
    return { start: currentDate, end: currentDate }
  }, [currentDate, view])

  const { data } = useSuspenseQuery(
    useEventsQueryOptions({
      schoolId,
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString(),
    })
  )

  const events = (data?.data ?? []) as APIEvent[]

  // Converter eventos da API para formato do calendário
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map((event: APIEvent) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.startsAt),
      end: event.endsAt ? new Date(event.endsAt) : new Date(event.startsAt),
      resource: event,
    }))
  }, [events])

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setEditEventId(event.id)
  }, [])

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate)
  }, [])

  const handleViewChange = useCallback((newView: View) => {
    setView(newView)
  }, [])

  // Estilo dos eventos baseado no tipo
  const eventStyleGetter = useCallback(
    (event: CalendarEvent): { className: string } => {
      const eventType = event.resource.type

      const colorMap: Record<string, string> = {
        EXAM: 'bg-red-500',
        ASSIGNMENT: 'bg-blue-500',
        ACADEMIC_EVENT: 'bg-green-500',
        FIELD_TRIP: 'bg-yellow-500',
        PARENTS_MEETING: 'bg-purple-500',
        SPORTS_EVENT: 'bg-orange-500',
        CULTURAL_EVENT: 'bg-pink-500',
        HOLIDAY: 'bg-gray-500',
      }

      const backgroundColor = colorMap[eventType] || 'bg-primary'

      return {
        className: `${backgroundColor} text-white border-0 rounded-md px-1`,
      }
    },
    []
  )

  return (
    <>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            {events.length} evento{events.length !== 1 ? 's' : ''}{' '}
            {view === 'month' && (
              <>em {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}</>
            )}
            {view === 'week' && (
              <>
                na semana de{' '}
                {format(startOfWeek(currentDate, { locale: ptBR }), 'dd/MM')}
              </>
            )}
            {view === 'day' && (
              <>em {format(currentDate, "dd 'de' MMMM", { locale: ptBR })}</>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            Clique em um evento para editar
          </p>
        </div>

        <div className="h-[700px]">
          <BigCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            culture="pt-BR"
            messages={messages}
            onSelectEvent={handleSelectEvent}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            view={view}
            date={currentDate}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
            components={{
              event: CustomEvent,
            }}
          />
        </div>
      </div>

      {/* Modal de edição */}
      {editEventId && (
        <EditEventModal
          open={!!editEventId}
          onOpenChange={(open) => !open && setEditEventId(null)}
          eventId={editEventId}
        />
      )}
    </>
  )
}

export function EventsCalendarSkeleton() {
  return (
    <div className="py-12 text-center">
      <Calendar className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
      <p className="mt-4 text-sm text-muted-foreground">Carregando eventos...</p>
    </div>
  )
}
