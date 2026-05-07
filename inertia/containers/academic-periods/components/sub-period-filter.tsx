import { useQuery } from '@tanstack/react-query'
import { CalendarRange } from 'lucide-react'
import { api } from '~/lib/api'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'

interface SubPeriod {
  id: string
  name: string
  order: number
}

interface SubPeriodFilterProps {
  academicPeriodId: string
  value: string
  onChange: (value: string) => void
}

export function SubPeriodFilter({ academicPeriodId, value, onChange }: SubPeriodFilterProps) {
  const { data } = useQuery({
    ...api.api.v1.academicSubPeriods.index.queryOptions({
      query: { academicPeriodId },
    }),
    enabled: !!academicPeriodId,
  })

  const subPeriods = (data?.data ?? []) as SubPeriod[]

  if (!subPeriods.length) return null

  return (
    <div className="flex items-center gap-2">
      <CalendarRange className="h-4 w-4 text-muted-foreground shrink-0" />
      <Tabs value={value} onValueChange={onChange} className="min-w-0">
        <TabsList className="h-8">
          <TabsTrigger value="" className="h-7 text-xs px-3">Todas</TabsTrigger>
          {subPeriods
            .sort((a, b) => a.order - b.order)
            .map((sp) => (
              <TabsTrigger key={sp.id} value={sp.id} className="h-7 text-xs px-3">
                {sp.name}
              </TabsTrigger>
            ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
