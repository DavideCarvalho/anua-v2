import { CalendarHeaderSkeleton } from '~/components/calendar-header-skeleton'
import { DayViewSkeleton } from '~/components/day-view-skeleton'
import { MonthViewSkeleton } from '~/components/month-view-skeleton'
import { WeekViewSkeleton } from '~/components/week-view-skeleton'
import type { TCalendarView } from '~/components/types'

interface CalendarSkeletonProps {
  view?: TCalendarView
  showHeader?: boolean
}

export function CalendarSkeleton({ view = 'month', showHeader = true }: CalendarSkeletonProps) {
  return (
    <div className="w-full rounded-xl border bg-card">
      {showHeader ? <CalendarHeaderSkeleton /> : null}
      <div className="min-h-[540px]">
        {view === 'week' ? <WeekViewSkeleton /> : null}
        {view === 'day' ? <DayViewSkeleton /> : null}
        {view === 'month' ? <MonthViewSkeleton /> : null}
      </div>
    </div>
  )
}
