import { useMemo, useState } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { useQuery } from '@tanstack/react-query'
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileSignature,
  FileText,
  List,
  Loader2,
  NotebookPen,
  XCircle,
} from 'lucide-react'
import type { Route } from '@tuyau/core/types'

import { api } from '~/lib/api'
import { cn } from '~/lib/utils'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'

type StudentCalendarResponse = Route.Response<'api.v1.responsavel.api.student_calendar'>
type CalendarItem = StudentCalendarResponse['items'][number]
type ViewMode = 'list' | 'week' | 'month'

interface StudentCalendarContainerProps {
  studentId: string
  studentName: string
}

function getTypeLabel(type: CalendarItem['sourceType']) {
  if (type === 'assignment') return 'Atividade'
  if (type === 'exam') return 'Prova'
  if (type === 'holiday') return 'Feriado'
  return 'Evento'
}

function getTypeVariant(type: CalendarItem['sourceType']): 'default' | 'secondary' | 'destructive' {
  if (type === 'assignment') return 'secondary'
  if (type === 'exam') return 'destructive'
  if (type === 'holiday') return 'secondary'
  return 'default'
}

function getTypeDotClass(type: CalendarItem['sourceType']) {
  if (type === 'assignment') return 'bg-amber-500'
  if (type === 'exam') return 'bg-rose-500'
  if (type === 'holiday') return 'bg-emerald-500'
  return 'bg-sky-500'
}

function itemDate(item: CalendarItem) {
  return new Date(item.startAt)
}

function dayKey(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

function ItemCard({ item, compact = false }: { item: CalendarItem; compact?: boolean }) {
  // Prova e atividade não capturam hora no form do professor — não exibir
  // "00:00" enganoso. Evento real (sourceType='event') mantém o horário.
  const showTime = item.sourceType === 'event' && !item.allDay
  const consent = item.sourceType === 'event' ? item.consent : null
  const isClickablePending = compact && consent && consent.status === 'PENDING'

  const content = (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className={cn('h-2 w-2 rounded-full', getTypeDotClass(item.sourceType))} />
        <Badge variant={getTypeVariant(item.sourceType)} className="text-[10px]">
          {getTypeLabel(item.sourceType)}
        </Badge>
        {showTime ? (
          <span className="text-xs text-muted-foreground">{format(itemDate(item), 'HH:mm')}</span>
        ) : null}
        {consent ? <ConsentBadge consent={consent} compact={compact} /> : null}
      </div>
      <p className="text-sm font-medium leading-tight">{item.title}</p>
      {item.subjectName ? (
        <p className="text-xs text-muted-foreground">{item.subjectName}</p>
      ) : null}
      {!compact && item.description ? (
        <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
      ) : null}
      {!compact && consent && consent.status === 'PENDING' ? (
        <ConsentActions consent={consent} />
      ) : null}
    </>
  )

  if (isClickablePending) {
    return (
      <Link
        route="web.responsavel.autorizacoes"
        className={cn(
          'block rounded-lg border bg-card p-3 transition-colors',
          'border-amber-500/40 hover:bg-amber-50/40'
        )}
      >
        {content}
      </Link>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-3 transition-colors hover:bg-muted/30">
      {content}
    </div>
  )
}

type ConsentInfo = NonNullable<Extract<CalendarItem, { sourceType: 'event' }>['consent']>

function ConsentBadge({ consent, compact = false }: { consent: ConsentInfo; compact?: boolean }) {
  const className = 'text-[10px] py-0 px-1.5'
  if (consent.status === 'APPROVED') {
    return (
      <Badge variant="outline" className={cn('border-emerald-500 text-emerald-600', className)}>
        <CheckCircle2 className="mr-1 h-3 w-3" />
        {compact ? 'OK' : 'Autorizado'}
      </Badge>
    )
  }
  if (consent.status === 'DENIED') {
    return (
      <Badge variant="outline" className={cn('border-destructive text-destructive', className)}>
        <XCircle className="mr-1 h-3 w-3" />
        Negado
      </Badge>
    )
  }
  if (consent.status === 'EXPIRED') {
    return (
      <Badge
        variant="outline"
        className={cn('border-muted-foreground text-muted-foreground', className)}
      >
        Expirado
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className={cn('border-amber-500 text-amber-600', className)}>
      {compact ? 'Autorizar' : 'Precisa autorizar'}
    </Badge>
  )
}

function ConsentActions({ consent }: { consent: ConsentInfo }) {
  if (consent.hasSignatureSubmission) {
    return <ConsentSignButton consentId={consent.id} />
  }
  // Tier "light" — sem PDF, responsável aprova/nega na página de autorizações
  // (mantemos um link curto pra não duplicar o dialog aqui).
  return (
    <div className="mt-3 flex gap-2">
      <Button asChild size="sm" variant="default">
        <a href="/responsavel/autorizacoes">Responder</a>
      </Button>
    </div>
  )
}

function ConsentSignButton({ consentId }: { consentId: string }) {
  const { data, isLoading, isError } = useQuery({
    ...api.api.v1.responsavel.api.consentSignatureLink.queryOptions({
      params: { consentId },
    }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  if (isLoading) {
    return (
      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Buscando link de assinatura...
      </p>
    )
  }

  if (isError || !data?.signatureLink) {
    return (
      <p className="mt-3 text-xs text-muted-foreground">
        O termo está em preparação. Recarregue em alguns segundos.
      </p>
    )
  }

  return (
    <div className="mt-3">
      <Button asChild size="sm" className="gap-2">
        <a href={data.signatureLink} target="_blank" rel="noopener noreferrer">
          <FileSignature className="h-3.5 w-3.5" />
          Assinar termo
          <ExternalLink className="h-3 w-3" />
        </a>
      </Button>
    </div>
  )
}

function ListView({ items }: { items: CalendarItem[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, CalendarItem[]>()
    for (const item of items) {
      const key = dayKey(itemDate(item))
      const dayItems = map.get(key) ?? []
      dayItems.push(item)
      map.set(key, dayItems)
    }

    for (const [, dayItems] of map) {
      dayItems.sort((a, b) => itemDate(a).getTime() - itemDate(b).getTime())
    }

    return Array.from(map.entries())
  }, [items])

  if (grouped.length === 0) {
    return <p className="text-sm text-muted-foreground">Sem itens nos próximos 30 dias.</p>
  }

  return (
    <div className="space-y-4">
      {grouped.map(([key, dayItems]) => (
        <div key={key} className="space-y-2">
          <p className="text-sm font-semibold">
            {format(new Date(`${key}T00:00:00`), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
          <div className="space-y-2">
            {dayItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function WeekView({ items, weekStart }: { items: CalendarItem[]; weekStart: Date }) {
  const days = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) }),
    [weekStart]
  )

  const itemsByDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>()
    for (const day of days) {
      map.set(dayKey(day), [])
    }
    for (const item of items) {
      const key = dayKey(itemDate(item))
      const dayItems = map.get(key)
      if (dayItems) dayItems.push(item)
    }
    return map
  }, [days, items])

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-7">
      {days.map((day) => {
        const key = dayKey(day)
        const dayItems = itemsByDay.get(key) ?? []
        return (
          <div key={key} className="rounded-lg border bg-card p-2">
            <p className="mb-2 border-b pb-2 text-xs font-semibold text-muted-foreground">
              {format(day, 'EEE dd/MM', { locale: ptBR })}
            </p>
            <div className="space-y-2">
              {dayItems.length > 0 ? (
                dayItems.map((item) => <ItemCard key={item.id} item={item} compact />)
              ) : (
                <p className="text-xs text-muted-foreground">Sem itens</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MonthView({ items, monthDate }: { items: CalendarItem[]; monthDate: Date }) {
  const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const weekLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']

  const itemsByDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>()
    for (const day of days) {
      map.set(dayKey(day), [])
    }
    for (const item of items) {
      const key = dayKey(itemDate(item))
      const dayItems = map.get(key)
      if (dayItems) dayItems.push(item)
    }
    return map
  }, [days, items])

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-2">
        {weekLabels.map((label) => (
          <div key={label} className="px-2 text-center text-xs font-semibold text-muted-foreground">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const key = dayKey(day)
          const dayItems = itemsByDay.get(key) ?? []
          return (
            <div
              key={key}
              className={cn(
                'min-h-28 rounded-lg border bg-card p-2',
                !isSameMonth(day, monthDate) && 'opacity-45'
              )}
            >
              <p className="mb-2 text-xs font-semibold text-muted-foreground">
                {format(day, 'dd')}
              </p>
              <div className="space-y-1">
                {dayItems.slice(0, 3).map((item) => {
                  const itemConsent = item.sourceType === 'event' ? item.consent : null
                  const needsAction = itemConsent?.status === 'PENDING'
                  const baseClasses =
                    'flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px]'

                  const inner = (
                    <>
                      <span
                        className={cn(
                          'inline-block h-1.5 w-1.5 shrink-0 rounded-full',
                          getTypeDotClass(item.sourceType)
                        )}
                      />
                      <span className="truncate">{item.title}</span>
                      {needsAction ? (
                        <FileSignature className="ml-auto h-3 w-3 shrink-0 text-amber-600" />
                      ) : null}
                    </>
                  )

                  if (needsAction) {
                    return (
                      <Link
                        key={item.id}
                        route="web.responsavel.autorizacoes"
                        className={cn(
                          baseClasses,
                          'border border-amber-500/40 bg-amber-50/50 hover:bg-amber-100/60'
                        )}
                        title="Precisa autorizar"
                      >
                        {inner}
                      </Link>
                    )
                  }

                  return (
                    <div key={item.id} className={cn(baseClasses, 'bg-muted')}>
                      {inner}
                    </div>
                  )
                })}
                {dayItems.length > 3 ? (
                  <p className="text-[10px] text-muted-foreground">+{dayItems.length - 3} itens</p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function StudentCalendarContainer({
  studentId,
  studentName,
}: StudentCalendarContainerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [activeDate, setActiveDate] = useState(new Date())

  const range = useMemo(() => {
    if (viewMode === 'list') {
      const start = startOfDay(new Date())
      const end = addDays(start, 30)
      return { start, end }
    }

    if (viewMode === 'week') {
      const start = startOfWeek(activeDate, { weekStartsOn: 1 })
      const end = endOfWeek(activeDate, { weekStartsOn: 1 })
      return { start, end }
    }

    const start = startOfMonth(activeDate)
    const end = endOfMonth(activeDate)
    return { start, end }
  }, [activeDate, viewMode])

  const { data, isLoading, isError, error } = useQuery(
    api.api.v1.responsavel.api.studentCalendar.queryOptions({
      params: { studentId },
      query: {
        view: viewMode,
        from: range.start.toISOString(),
        to: range.end.toISOString(),
      },
    })
  )

  const items = data?.items ?? []
  const rangeLabel =
    viewMode === 'list'
      ? `Proximos 30 dias (${format(range.start, 'dd/MM')} - ${format(range.end, 'dd/MM')})`
      : `${format(range.start, 'dd/MM')} - ${format(range.end, 'dd/MM')}`

  const handlePrevious = () => {
    if (viewMode === 'week') {
      setActiveDate((prev) => addWeeks(prev, -1))
      return
    }

    setActiveDate((prev) => addMonths(prev, -1))
  }

  const handleNext = () => {
    if (viewMode === 'week') {
      setActiveDate((prev) => addWeeks(prev, 1))
      return
    }

    setActiveDate((prev) => addMonths(prev, 1))
  }

  if (isLoading) {
    return <StudentCalendarContainerSkeleton />
  }

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-12 text-center">
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : 'Erro ao carregar calendario'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Calendário de {studentName}
        </CardTitle>
        <CardDescription>
          Acompanhe atividades, provas e eventos em modo somente leitura.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
            <TabsList>
              <TabsTrigger value="list" className="gap-2">
                <List className="h-4 w-4" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="week" className="gap-2">
                <NotebookPen className="h-4 w-4" />
                Semana
              </TabsTrigger>
              <TabsTrigger value="month" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                Mês
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {viewMode !== 'list' ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                aria-label="Período anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {format(activeDate, 'MMMM yyyy', { locale: ptBR })}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleNext}
                aria-label="Próximo período"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/20 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">{rangeLabel}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Atividades
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Provas
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-sky-500" /> Eventos
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Feriados
            </span>
          </div>
        </div>

        {viewMode === 'list' ? <ListView items={items} /> : null}
        {viewMode === 'week' ? (
          <WeekView items={items} weekStart={startOfWeek(activeDate, { weekStartsOn: 1 })} />
        ) : null}
        {viewMode === 'month' ? <MonthView items={items} monthDate={activeDate} /> : null}

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            <FileText className="mx-auto mb-2 h-4 w-4" />
            Nenhum item encontrado para o período selecionado.
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function StudentCalendarContainerSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-4 w-80" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
