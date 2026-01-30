import { Suspense, useState } from 'react'
import { useSuspenseQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import {
  AlertTriangle,
  CalendarClock,
  FileClock,
  FileSignature,
  Clock,
  UserX,
  AlertCircle,
  Brain,
  CheckCircle2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useEscolaInsightsQueryOptions, type Insight } from '../hooks/queries/use_escola_insights'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { cn } from '../lib/utils'

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  'alert-triangle': AlertTriangle,
  'calendar-clock': CalendarClock,
  'file-clock': FileClock,
  'file-signature': FileSignature,
  'user-clock': Clock,
  'user-x': UserX,
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

// Individual Insight Item
function InsightItem({
  insight,
  onClick,
}: {
  insight: Insight
  onClick: () => void
}) {
  const Icon = iconMap[insight.icon] || AlertCircle
  const config = priorityConfig[insight.priority]

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg border-l-4 transition-colors hover:bg-muted/50',
        config.border,
        config.bg
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5', config.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm">{insight.title}</span>
            <span className="text-lg font-bold">{insight.value}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {insight.description}
          </p>
        </div>
      </div>
    </button>
  )
}

// Insight Detail Modal
function InsightDetailModal({
  insight,
  open,
  onOpenChange,
}: {
  insight: Insight | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!insight) return null

  const Icon = iconMap[insight.icon] || AlertCircle
  const config = priorityConfig[insight.priority]

  // Build action URL based on insight type
  const getActionUrl = () => {
    switch (insight.id) {
      case 'overdue-payments':
      case 'upcoming-payments':
        return '/escola/financeiro/mensalidades'
      case 'pending-documents':
      case 'pending-signatures':
      case 'pending-enrollments':
        return '/escola/administrativo/alunos'
      case 'high-absence-rate':
        return '/escola/pedagogico/frequencia'
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
              <DialogDescription>{insight.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="text-center py-6">
            <div className="text-4xl font-bold mb-2">{insight.value}</div>
            <p className="text-sm text-muted-foreground">
              {insight.type === 'financial' && 'pagamento(s)'}
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary animate-pulse" />
          <CardTitle>Avisos Recentes</CardTitle>
        </div>
        <CardDescription>Carregando...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-3 rounded-lg border-l-4 border-l-muted bg-muted/20">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 bg-muted animate-pulse rounded" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-48 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Error Fallback
function InsightsError({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <Card className="border-destructive">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle>Avisos Recentes</CardTitle>
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
function InsightsContent() {
  const { data } = useSuspenseQuery(useEscolaInsightsQueryOptions())
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null)

  const insights = data.insights as Insight[]
  const displayedInsights = insights.slice(0, 5)
  const hasMore = insights.length > 5

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Avisos Recentes</CardTitle>
            </div>
            {insights.length > 0 && (
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                {insights.length}
              </span>
            )}
          </div>
          <CardDescription>Pontos de atenção da sua escola</CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="font-medium text-green-700">Tudo certo por aqui!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Não há avisos pendentes no momento
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayedInsights.map((insight) => (
                <InsightItem
                  key={insight.id}
                  insight={insight}
                  onClick={() => setSelectedInsight(insight)}
                />
              ))}
              {hasMore && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  +{insights.length - 5} aviso(s) adicionais
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <InsightDetailModal
        insight={selectedInsight}
        open={!!selectedInsight}
        onOpenChange={(open) => !open && setSelectedInsight(null)}
      />
    </>
  )
}

// Container Export
export function EscolaInsightsContainer() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <InsightsError error={error as Error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <Suspense fallback={<InsightsSkeleton />}>
            <InsightsContent />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
