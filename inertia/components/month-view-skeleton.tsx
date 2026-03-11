import { Loader2 } from 'lucide-react'
import { Skeleton } from '~/components/ui/skeleton'

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function MonthViewSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-7 border-b py-2">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="flex justify-center">
            <span className="text-xs font-medium text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 grid-rows-6">
        {Array.from({ length: 42 }).map((_, i) => (
          <div key={i} className="border-b border-r bg-muted/30 p-2">
            <Skeleton className="h-5 w-5 rounded-full bg-muted" />
            <div className="mt-3 flex h-16 items-center justify-center rounded-md bg-muted/40">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
