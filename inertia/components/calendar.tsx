'use client'

import { useEffect, useState } from 'react'
import { CalendarBody } from '~/components/calendar-body'
import { CalendarSkeleton } from '~/components/calendar-skeleton'
import { CalendarProvider } from '~/components/calendar-context'
import { DndProvider } from '~/components/dnd-context'
import { CalendarHeader } from '~/components/calendar-header'
import type { IEvent, IUser } from '~/components/interfaces'
import type { TCalendarView } from '~/components/types'
import { getEvents, getUsers } from '~/components/requests'

interface CalendarProps {
  events?: IEvent[]
  users?: IUser[]
  initialView?: TCalendarView
  isLoading?: boolean
  showHeader?: boolean
  emptyDayActionLabel?: string
  onEmptyDayAction?: (date: Date, action: 'assignment' | 'exam' | 'event') => void
  selectedDate?: Date
}

export function Calendar({
  events: providedEvents,
  users: providedUsers,
  initialView = 'month',
  isLoading = false,
  showHeader = true,
  emptyDayActionLabel,
  onEmptyDayAction,
  selectedDate,
}: CalendarProps) {
  const usesProvidedData = Array.isArray(providedEvents) && Array.isArray(providedUsers)
  const [events, setEvents] = useState<IEvent[]>(providedEvents ?? [])
  const [users, setUsers] = useState<IUser[]>(providedUsers ?? [])
  const [isFetching, setIsFetching] = useState(!usesProvidedData)

  useEffect(() => {
    if (usesProvidedData) {
      setEvents(providedEvents)
      setUsers(providedUsers)
      setIsFetching(false)
      return
    }

    let mounted = true

    const load = async () => {
      const [eventsData, usersData] = await Promise.all([getEvents(), getUsers()])

      if (!mounted) return

      setEvents(eventsData)
      setUsers(usersData)
      setIsFetching(false)
    }

    load().catch(() => {
      if (!mounted) return
      setEvents([])
      setUsers([])
      setIsFetching(false)
    })

    return () => {
      mounted = false
    }
  }, [providedEvents, providedUsers, usesProvidedData])

  if (isLoading || isFetching) {
    return <CalendarSkeleton view={initialView} showHeader={showHeader} />
  }

  return (
    <CalendarProvider events={events} users={users} view={initialView} selectedDate={selectedDate}>
      <DndProvider>
        <div className="w-full border rounded-xl">
          {showHeader ? <CalendarHeader /> : null}
          <CalendarBody
            emptyDayActionLabel={emptyDayActionLabel}
            onEmptyDayAction={onEmptyDayAction}
          />
        </div>
      </DndProvider>
    </CalendarProvider>
  )
}
