import { Suspense } from 'react'
import { useSuspenseQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useResponsavelStatsQueryOptions } from '../hooks/queries/use_responsavel_stats'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { BookOpen, Calendar, DollarSign, Trophy, AlertCircle, Bell } from 'lucide-react'

// Loading Skeleton
function ResponsavelStatsSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-4">
          <div className="h-5 w-48 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Error Fallback
function ResponsavelStatsError({
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
          <h3 className="font-semibold text-destructive">Erro ao carregar dados</h3>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Ocorreu um erro inesperado'}
          </p>
        </div>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}

// Content Component
function ResponsavelStatsContent() {
  const { data } = useSuspenseQuery(useResponsavelStatsQueryOptions())

  return (
    <div className="space-y-4">
      {/* Notifications */}
      {data.notifications > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center gap-4 py-4">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">
                Você tem {data.notifications} nova(s) notificação(ões)
              </p>
              <a href="/responsavel/comunicados" className="text-sm text-primary hover:underline">
                Ver comunicados
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Seus Filhos</h2>

        {data.students.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum aluno vinculado à sua conta
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.students.map((student) => (
              <Card key={student.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{student.name}</CardTitle>
                  <CardDescription>
                    {student.className} - {student.courseName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Média</p>
                        <p className="font-medium">
                          {student.averageGrade !== null ? student.averageGrade.toFixed(1) : '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Frequência</p>
                        <p className="font-medium">
                          {student.attendanceRate !== null ? `${student.attendanceRate}%` : '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pendências</p>
                        <p
                          className={`font-medium ${student.pendingPayments > 0 ? 'text-destructive' : ''}`}
                        >
                          {student.pendingPayments > 0
                            ? `${student.pendingPayments} parcela(s)`
                            : 'Em dia'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pontos</p>
                        <p className="font-medium">{student.points}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Container Export
export function ResponsavelStatsContainer() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <ResponsavelStatsError error={error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <Suspense fallback={<ResponsavelStatsSkeleton />}>
            <ResponsavelStatsContent />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
