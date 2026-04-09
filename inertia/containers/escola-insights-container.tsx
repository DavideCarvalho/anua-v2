import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import {
  AlertTriangle,
  CalendarClock,
  FileClock,
  FileSignature,
  Clock,
  UserX,
  AlertCircle,
  CheckCircle2,
  Package,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { Route } from '@tuyau/core/types'
import { api } from '~/lib/api'
import { DashboardCardBoundary } from '~/components/dashboard-card-boundary'

type Insight = Route.Response<'api.v1.dashboard.escola_insights'>['insights'][number]
type InsightInvoice = Route.Response<'api.v1.invoices.index'>['data'][number]
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { cn, formatCurrency } from '../lib/utils'

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  'alert-triangle': AlertTriangle,
  'calendar-clock': CalendarClock,
  'file-clock': FileClock,
  'file-signature': FileSignature,
  'user-clock': Clock,
  'user-x': UserX,
  'package': Package,
}

// Priority colors
const priorityConfig = {
  high: {
    border: 'border-l-destructive',
    bg: 'bg-destructive/5',
    icon: 'text-destructive',
    badge: 'bg-destructive text-destructive-foreground',
  },
  medium: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/5',
    icon: 'text-amber-600',
    badge: 'bg-amber-500 text-white',
  },
  low: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-500/5',
    icon: 'text-blue-600',
    badge: 'bg-blue-500 text-white',
  },
}

function getMetadataNumber(
  metadata: Record<string, unknown> | undefined,
  key: string
): number | null {
  if (!metadata) return null
  const value = metadata[key]
  if (typeof value !== 'number' || Number.isNaN(value)) return null
  return value
}

function formatInsightDescription(insight: Insight, hideFinancialValues = false): string {
  if (insight.id === 'overdue-payments') {
    const totalAmountInCents = getMetadataNumber(insight.metadata, 'totalAmount')
    const avgDaysOverdue = getMetadataNumber(insight.metadata, 'avgDaysOverdue')

    if (totalAmountInCents !== null && avgDaysOverdue !== null) {
      return `${hideFinancialValues ? 'R$ ****' : formatCurrency(totalAmountInCents)} em atraso (média ${avgDaysOverdue} dias)`
    }
  }

  if (insight.id === 'upcoming-payments') {
    const totalAmountInCents = getMetadataNumber(insight.metadata, 'totalAmount')
    if (totalAmountInCents !== null) {
      return `${hideFinancialValues ? 'R$ ****' : formatCurrency(totalAmountInCents)} vencem nos próximos 7 dias`
    }
  }

  if (hideFinancialValues && insight.type === 'financial') {
    return insight.description.replace(/R\$\s?\d[\d\.]*,\d{2}/g, 'R$ ****')
  }

  return insight.description
}

function getMetadataStringArray(
  metadata: Record<string, unknown> | undefined,
  key: string
): string[] {
  if (!metadata) return []
  const value = metadata[key]
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item)).filter(Boolean)
}

function getLatePaymentStatsByStudent(insight: Insight): Record<string, string> {
  const metadata = insight.metadata
  if (!metadata) return {}

  const raw = metadata.latePaymentStats
  if (!Array.isArray(raw)) return {}

  const map: Record<string, string> = {}

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue

    const studentId = String((item as { studentId?: unknown }).studentId || '')
    const latePaidInvoices = Number((item as { latePaidInvoices?: unknown }).latePaidInvoices || 0)
    const totalPaidInvoices = Number(
      (item as { totalPaidInvoices?: unknown }).totalPaidInvoices || 0
    )

    if (!studentId) continue
    map[studentId] = `${latePaidInvoices}/${totalPaidInvoices}`
  }

  return map
}

function getInvoiceStatusLabel(status: string): string {
  switch (status) {
    case 'OPEN':
      return 'Aberta'
    case 'PENDING':
      return 'Pendente'
    case 'PAID':
      return 'Paga'
    case 'OVERDUE':
      return 'Vencida'
    case 'CANCELLED':
      return 'Cancelada'
    case 'RENEGOTIATED':
      return 'Renegociada'
    default:
      return status
  }
}

function getInvoiceStatusClassName(status: string): string {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-700'
    case 'OVERDUE':
      return 'bg-red-100 text-red-700'
    case 'PENDING':
    case 'OPEN':
      return 'bg-amber-100 text-amber-700'
    case 'RENEGOTIATED':
      return 'bg-purple-100 text-purple-700'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'

  const parsed = typeof date === 'string' ? DateTime.fromISO(date) : DateTime.fromJSDate(date)
  if (!parsed.isValid) return '-'

  return parsed.toFormat('dd/MM/yyyy')
}

function getFinancialInsightQuery(insight: Insight) {
  const today = DateTime.now().startOf('day')
  const inSevenDays = today.plus({ days: 7 })
  const studentIds = getMetadataStringArray(insight.metadata, 'studentIds')

  const baseQuery = {
    page: 1,
    limit: 50,
    sortBy: 'dueDate',
    sortDirection: 'asc',
  }

  switch (insight.id) {
    case 'upcoming-payments':
      return {
        ...baseQuery,
        status: 'OPEN,PENDING',
        dueDateFrom: today.toISODate() || undefined,
        dueDateTo: inSevenDays.toISODate() || undefined,
      }
    case 'chronic-late-payers':
      return {
        ...baseQuery,
        status: 'OPEN,PENDING,OVERDUE',
        studentIds: studentIds.length > 0 ? studentIds.join(',') : undefined,
      }
    case 'risky-upcoming-due-dates':
      return {
        ...baseQuery,
        status: 'OPEN,PENDING',
        studentIds: studentIds.length > 0 ? studentIds.join(',') : undefined,
        dueDateFrom: today.toISODate() || undefined,
        dueDateTo: inSevenDays.toISODate() || undefined,
      }
    case 'overdue-payments':
    default:
      return {
        ...baseQuery,
        status: 'OPEN,PENDING,OVERDUE',
        dueDateTo: today.toISODate() || undefined,
      }
  }
}

function FinancialInsightInvoicesTable({ insight }: { insight: Insight }) {
  const invoicesQuery = useMemo(() => getFinancialInsightQuery(insight), [insight])

  const { data, isLoading } = useQuery(
    api.api.v1.invoices.index.queryOptions({
      query: invoicesQuery,
    } as any)
  )

  const invoices = (data?.data ?? []) as InsightInvoice[]
  const lateStatsByStudent = useMemo(() => getLatePaymentStatsByStudent(insight), [insight])
  const showLateStatsColumn = insight.id === 'chronic-late-payers'

  const displayedInvoices = useMemo(() => {
    if (insight.id !== 'chronic-late-payers') {
      return invoices
    }

    const byStudent = new Map<string, InsightInvoice>()

    for (const invoice of invoices) {
      const studentId = String((invoice as InsightInvoice & { studentId?: string }).studentId || '')
      if (!studentId) continue

      const current = byStudent.get(studentId)
      if (!current) {
        byStudent.set(studentId, invoice)
        continue
      }

      const currentDue = DateTime.fromISO(String(current.dueDate || ''))
      const nextDue = DateTime.fromISO(String(invoice.dueDate || ''))
      if (currentDue.isValid && nextDue.isValid && nextDue < currentDue) {
        byStudent.set(studentId, invoice)
      }
    }

    return [...byStudent.values()].sort((a, b) => {
      const aDue = DateTime.fromISO(String(a.dueDate || ''))
      const bDue = DateTime.fromISO(String(b.dueDate || ''))
      if (!aDue.isValid || !bDue.isValid) return 0
      return aDue.toMillis() - bDue.toMillis()
    })
  }, [insight.id, invoices])

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando faturas...</p>
  }

  if (displayedInvoices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhuma fatura encontrada para este alerta.</p>
    )
  }

  return (
    <div className="max-h-[55vh] overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aluno</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Status</TableHead>
            {showLateStatsColumn && <TableHead className="text-right">Atrasadas/Total</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedInvoices.map((invoice) => {
            const studentName =
              (invoice as InsightInvoice & { student?: { user?: { name?: string } } }).student?.user
                ?.name || '-'

            return (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{studentName}</TableCell>
                <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell className="text-right">{formatCurrency(invoice.totalAmount)}</TableCell>
                <TableCell>
                  <Badge className={getInvoiceStatusClassName(invoice.status)}>
                    {getInvoiceStatusLabel(invoice.status)}
                  </Badge>
                </TableCell>
                {showLateStatsColumn && (
                  <TableCell className="text-right">
                    {lateStatsByStudent[String(invoice.studentId || '')] || '-'}
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

// Insight Detail Sheet
function InsightDetailSheet({
  insight,
  open,
  onOpenChange,
  hideFinancialValues = false,
}: {
  insight: Insight | null
  open: boolean
  onOpenChange: (open: boolean) => void
  hideFinancialValues?: boolean
}) {
  if (!insight) return null

  const Icon = iconMap[insight.icon] || AlertCircle
  const config = priorityConfig[insight.priority]
  const displayDescription = formatInsightDescription(insight, hideFinancialValues)
  const displayValue = insight.value
  const isFinancialInsight = insight.type === 'financial'

  // Build action URL based on insight type
  const getActionUrl = () => {
    switch (insight.id) {
      case 'overdue-payments':
      case 'upcoming-payments':
        return '/escola/financeiro/faturas'
      case 'pending-documents':
      case 'pending-signatures':
      case 'pending-enrollments':
        return '/escola/administrativo/alunos'
      case 'high-absence-rate':
        return '/escola/pedagogico/presenca'
      case 'pending-delivery-orders':
        return '/escola/lojas'
      default:
        return null
    }
  }

  const actionUrl = getActionUrl()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', config.bg, config.icon)}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <SheetTitle>{insight.title}</SheetTitle>
              <SheetDescription>{displayDescription}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="py-4">
          {!isFinancialInsight && (
            <div className="text-center py-6">
              <div className="text-4xl font-bold mb-2">{displayValue}</div>
              <p className="text-sm text-muted-foreground">
                {insight.id === 'pending-delivery-orders' && 'pedido(s)'}
                {insight.type === 'financial' &&
                  insight.id !== 'pending-delivery-orders' &&
                  'pagamento(s)'}
                {insight.type === 'enrollment' && 'pendência(s)'}
                {insight.type === 'academic' && 'aluno(s)'}
              </p>
            </div>
          )}

          {isFinancialInsight && <FinancialInsightInvoicesTable insight={insight} />}

          {actionUrl && (
            <div className="flex justify-end">
              <Button asChild>
                <a href={actionUrl}>Ver detalhes</a>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Loading Skeleton
function InsightsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-12 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-48 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Error Fallback
function InsightsError({
  title,
  error,
  resetErrorBoundary,
}: {
  title: string
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <Card className="border-destructive">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {error.message || 'Erro ao carregar avisos'}
        </p>
        <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}

// Content Component
function InsightsContent({
  hideFinancialValues = false,
  allowedTypes,
  academicPeriodId,
  courseId,
  levelId,
  classId,
  title = 'Avisos Recentes',
}: {
  hideFinancialValues?: boolean
  allowedTypes?: Insight['type'][]
  academicPeriodId?: string
  courseId?: string
  levelId?: string
  classId?: string
  title?: string
}) {
  const { data, isLoading, error } = useQuery(
    api.api.v1.dashboard.escolaInsights.queryOptions({
      query: {
        academicPeriodId,
        courseId,
        levelId,
        classId,
      },
    } as any)
  )
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null)

  if (isLoading || !data) {
    return <InsightsSkeleton />
  }

  if (error) {
    return <InsightsError title={title} error={error as Error} resetErrorBoundary={() => {}} />
  }

  const allInsights = data.insights as Insight[]
  const insights = allowedTypes?.length
    ? allInsights.filter((insight) => allowedTypes.includes(insight.type))
    : allInsights

  const emptyDescription =
    allowedTypes?.length === 1 && allowedTypes[0] === 'financial'
      ? 'Não há alertas financeiros no momento'
      : allowedTypes?.length === 1 && allowedTypes[0] === 'enrollment'
        ? 'Não há alertas administrativos no momento'
        : allowedTypes?.length === 1 && allowedTypes[0] === 'academic'
          ? 'Não há alertas pedagógicos no momento'
          : 'Não há avisos pendentes no momento'

  return (
    <>
      {insights.length === 0 ? (
        <Card>
          <CardContent className="py-7">
            <div className="min-h-[116px] text-center flex flex-col items-center justify-center">
              <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-500" />
              <p className="text-base font-semibold text-green-700">Tudo em ordem!</p>
              <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight) => {
            const Icon = iconMap[insight.icon] || AlertCircle
            const config = priorityConfig[insight.priority]
            const displayDescription = formatInsightDescription(insight, hideFinancialValues)
            const displayValue = insight.value

            return (
              <Card
                key={insight.id}
                className={cn(
                  'cursor-pointer border-l-4 border-l-transparent transition-colors',
                  config.bg,
                  config.border
                )}
                onClick={() => setSelectedInsight(insight)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Icon className={cn('h-4 w-4', config.icon)} />
                    {insight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{displayValue}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{displayDescription}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <InsightDetailSheet
        insight={selectedInsight}
        open={!!selectedInsight}
        onOpenChange={(open: boolean) => !open && setSelectedInsight(null)}
        hideFinancialValues={hideFinancialValues}
      />
    </>
  )
}

// Container Export
export function EscolaInsightsContainer({
  hideFinancialValues = false,
  allowedTypes,
  academicPeriodId,
  courseId,
  levelId,
  classId,
}: {
  hideFinancialValues?: boolean
  allowedTypes?: Insight['type'][]
  academicPeriodId?: string
  courseId?: string
  levelId?: string
  classId?: string
}) {
  const title =
    allowedTypes?.length === 1 && allowedTypes[0] === 'financial'
      ? 'Alertas Financeiros'
      : allowedTypes?.length === 1 && allowedTypes[0] === 'enrollment'
        ? 'Alertas Administrativos'
        : allowedTypes?.length === 1 && allowedTypes[0] === 'academic'
          ? 'Alertas Pedagógicos'
          : 'Alertas'

  return (
    <DashboardCardBoundary
      title={title}
      queryKeys={[
        api.api.v1.dashboard.escolaInsights.queryOptions({
          query: {
            academicPeriodId,
            courseId,
            levelId,
            classId,
          },
        } as any).queryKey,
      ]}
    >
      <InsightsContent
        hideFinancialValues={hideFinancialValues}
        allowedTypes={allowedTypes}
        academicPeriodId={academicPeriodId}
        courseId={courseId}
        levelId={levelId}
        classId={classId}
        title={title}
      />
    </DashboardCardBoundary>
  )
}
