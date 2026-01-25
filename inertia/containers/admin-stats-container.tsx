import { Suspense } from 'react'
import { useSuspenseQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useAdminStatsQueryOptions } from '../hooks/queries/use_admin_stats'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Building2, Users, DollarSign, TrendingUp, AlertCircle, AlertTriangle } from 'lucide-react'

// Loading Skeleton
function AdminStatsSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-4">
          <div className="h-5 w-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Error Fallback
function AdminStatsError({
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
          <h3 className="font-semibold text-destructive">Erro ao carregar estatísticas</h3>
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
function AdminStatsContent() {
  const { data: stats } = useSuspenseQuery(useAdminStatsQueryOptions())

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {(stats.blockedSchools > 0 || stats.pendingInvoices > 0) && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium">Atenção necessária</p>
              <p className="text-sm text-muted-foreground">
                {stats.blockedSchools > 0 && `${stats.blockedSchools} escola(s) bloqueada(s). `}
                {stats.pendingInvoices > 0 && `${stats.pendingInvoices} fatura(s) pendente(s).`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Escolas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchools}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSchools} ativas, {stats.trialSchools} em trial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Em todas as escolas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(stats.monthlyRevenue / 100)}
            </div>
            <p className="text-xs text-muted-foreground">Assinaturas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professores</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Cadastrados na plataforma</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Container Export
export function AdminStatsContainer() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <AdminStatsError error={error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <Suspense fallback={<AdminStatsSkeleton />}>
            <AdminStatsContent />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
