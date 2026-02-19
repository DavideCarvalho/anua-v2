import { Suspense } from 'react'
import { useSuspenseQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  ClipboardList,
  Users,
  CheckSquare,
} from 'lucide-react'
import { useEscolaTeacherDashboardQueryOptions } from '../hooks/queries/use_escola_teacher_dashboard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'

function TeacherDashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded bg-muted" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function TeacherDashboardError({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex items-center gap-4 py-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="flex-1">
          <h3 className="font-semibold text-destructive">Erro ao carregar dashboard pedagógico</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}

function TeacherDashboardContent() {
  const { data } = useSuspenseQuery(useEscolaTeacherDashboardQueryOptions())

  const statCards = [
    {
      title: 'Turmas sob sua responsabilidade',
      value: data.stats.classesCount,
      icon: BookOpen,
    },
    {
      title: 'Alunos acompanhados',
      value: data.stats.studentsCount,
      icon: Users,
    },
    {
      title: 'Pendências de presença',
      value: data.stats.classesWithoutRecentAttendance,
      icon: ClipboardList,
    },
    {
      title: 'Pendências de nota',
      value: data.stats.pendingGradesCount,
      icon: CheckSquare,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Avisos pedagógicos</CardTitle>
          <CardDescription>Priorize estes pontos para manter as turmas em dia</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.alerts.length === 0 ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Sem alertas críticos no momento. Continue acompanhando as turmas.
            </div>
          ) : (
            data.alerts.map((alert) => (
              <a
                key={alert.id}
                href={alert.href}
                className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <AlertTriangle
                  className={`mt-0.5 h-4 w-4 ${alert.priority === 'high' ? 'text-destructive' : 'text-amber-600'}`}
                />
                <div>
                  <p className="font-medium text-sm">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
              </a>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function EscolaTeacherDashboardContainer() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <TeacherDashboardError error={error as Error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <Suspense fallback={<TeacherDashboardSkeleton />}>
            <TeacherDashboardContent />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
