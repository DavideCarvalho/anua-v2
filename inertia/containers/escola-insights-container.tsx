import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
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

// Insight Detail Modal
function InsightDetailModal({
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', config.bg, config.icon)}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>{insight.title}</DialogTitle>
              <DialogDescription>{displayDescription}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
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

          {actionUrl && (
            <div className="flex justify-end">
              <Button asChild>
                <a href={actionUrl}>Ver detalhes</a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
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

      <InsightDetailModal
        insight={selectedInsight}
        open={!!selectedInsight}
        onOpenChange={(open) => !open && setSelectedInsight(null)}
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
