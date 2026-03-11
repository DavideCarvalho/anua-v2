import { Loader2 } from 'lucide-react'
import { Skeleton } from '~/components/ui/skeleton'

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function WeekViewSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-8 border-b">
        <div className="w-18"></div>
        {WEEK_DAYS.map((day) => (
          <div key={day} className="flex flex-col items-center justify-center py-2">
            <span className="text-xs font-medium text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-1 overflow-y-auto">
        <div className="w-18 flex-shrink-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="relative h-12 border-b pr-2 text-right">
              <Skeleton className="absolute -top-3 right-2 h-4 w-10" />
            </div>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-7 divide-x">
          {Array.from({ length: 7 }).map((_, dayIndex) => (
            <div key={dayIndex} className="relative bg-muted/20">
              <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
              {Array.from({ length: 12 }).map((_, hourIndex) => (
                <div key={hourIndex} className="h-12 border-b"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
