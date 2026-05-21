import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@adonisjs/inertia/react'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Route } from '@tuyau/core/types'

import { api } from '~/lib/api'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'

type StudentCalendarResponse = Route.Response<'api.v1.responsavel.api.student_calendar'>
type CalendarItem = StudentCalendarResponse['items'][number]

const UPCOMING_WINDOW_DAYS = 14

interface UpcomingExamsCardProps {
  studentId: string
}

/**
 * Card resumo de provas dos próximos 14 dias. Linka pro /calendario pro detalhe
 * completo. Existe pra cobrir mães que olham só /atividades e esquecem que
 * provas ficam no Calendário.
 */
export function UpcomingExamsCard({ studentId }: UpcomingExamsCardProps) {
  const range = useMemo(() => {
    const now = new Date()
    const end = new Date(now)
    end.setDate(end.getDate() + UPCOMING_WINDOW_DAYS)
    return { from: now.toISOString(), to: end.toISOString() }
  }, [])

  const { data, isLoading } = useQuery(
    api.api.v1.responsavel.api.studentCalendar.queryOptions({
      params: { studentId },
      query: { view: 'list', from: range.from, to: range.to },
    })
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const exams = (data?.items ?? []).filter((item: CalendarItem) => item.sourceType === 'exam')

  if (exams.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-rose-500" />
          Próximas provas
          <Badge variant="secondary" className="ml-1">
            {exams.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {exams.slice(0, 5).map((exam: CalendarItem) => {
          const date = new Date(exam.startAt)
          return (
            <div
              key={exam.id}
              className="flex items-start justify-between gap-3 rounded-lg border bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{exam.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {exam.subjectName ? <Badge variant="outline">{exam.subjectName}</Badge> : null}
                  <span>{format(date, "EEE, dd 'de' MMM", { locale: ptBR })}</span>
                </div>
                {exam.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {exam.description}
                  </p>
                ) : null}
              </div>
            </div>
          )
        })}
        <Link
          route="web.responsavel.calendario"
          className="mt-2 flex items-center justify-end gap-1 text-xs font-medium text-primary hover:underline"
        >
          Ver tudo no Calendário
          <ChevronRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  )
}
