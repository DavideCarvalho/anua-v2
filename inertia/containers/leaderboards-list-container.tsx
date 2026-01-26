import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useQueryStates, parseAsInteger } from 'nuqs'
import { useLeaderboardsQueryOptions } from '../hooks/queries/use_leaderboards'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { ChevronLeft, ChevronRight, AlertCircle, Trophy } from 'lucide-react'

function LeaderboardsSkeleton() {
  return (
    <div className="border rounded-lg">
      <div className="p-4 border-b">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="p-4 border-b last:border-0">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function LeaderboardsErrorFallback({
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
          <h3 className="font-semibold text-destructive">Erro ao carregar rankings</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}

export function LeaderboardsListContainer() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <LeaderboardsErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <LeaderboardsListContent />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

function LeaderboardsListContent() {
  // URL state with nuqs
  const [filters, setFilters] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  })

  const { page, limit } = filters

  const { data, isLoading, error, refetch } = useQuery(useLeaderboardsQueryOptions({ page, limit }))

  const leaderboards = Array.isArray(data) ? data : data?.data || []
  const meta = !Array.isArray(data) && data?.meta ? data.meta : null

  if (isLoading) {
    return <LeaderboardsSkeleton />
  }

  if (error) {
    return <LeaderboardsErrorFallback error={error} resetErrorBoundary={() => refetch()} />
  }

  if (leaderboards.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Nenhum ranking encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Crie um ranking para acompanhar pontos e desempenho
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">Nome</th>
              <th className="text-left p-4 font-medium">Tipo</th>
              <th className="text-left p-4 font-medium">Período</th>
              <th className="text-left p-4 font-medium">Ativo</th>
            </tr>
          </thead>
          <tbody>
            {leaderboards.map((lb: any) => (
              <tr key={lb.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium">{lb.name}</td>
                <td className="p-4 text-muted-foreground">{lb.metricType || lb.type}</td>
                <td className="p-4 text-muted-foreground">{lb.periodType || lb.period}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      lb.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {lb.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {leaderboards.length} de {meta.total} rankings
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setFilters({ page: page - 1 })}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {page} de {meta.lastPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.lastPage}
              onClick={() => setFilters({ page: page + 1 })}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
