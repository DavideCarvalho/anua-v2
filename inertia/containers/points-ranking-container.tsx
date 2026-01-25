import { Suspense } from 'react'
import { useSuspenseQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { Trophy, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { usePointsRankingQueryOptions } from '../hooks/queries/use_points_ranking'

function PointsRankingSkeleton() {
  return (
    <Card>
      <CardContent className="py-10">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PointsRankingError({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex items-center gap-4 py-6">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <div className="flex-1">
          <p className="font-medium text-destructive">Erro ao carregar ranking</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}

function PointsRankingContent({ schoolId }: { schoolId: string }) {
  const { data } = useSuspenseQuery(usePointsRankingQueryOptions({ schoolId, limit: 10 }))

  const ranking = (data as any)?.ranking ?? []

  if (ranking.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Nenhum aluno no ranking ainda
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Top 10 Pontos</h3>
        </div>

        <div className="space-y-3">
          {ranking.map((item: any) => (
            <div key={item.studentId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 text-sm text-muted-foreground">#{item.rank}</div>
                <div className="font-medium">
                  {item.student?.user?.name || item.student?.name || 'Aluno'}
                </div>
              </div>
              <div className="text-sm font-semibold">{item.points} pts</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function PointsRankingContainer({ schoolId }: { schoolId: string }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <PointsRankingError error={error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <Suspense fallback={<PointsRankingSkeleton />}>
            <PointsRankingContent schoolId={schoolId} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
