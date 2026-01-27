import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { AlertCircle } from 'lucide-react'

function useBalanceQueryOptions(studentId: string) {
  return {
    queryKey: ['responsavel', 'student', studentId, 'balance'],
    queryFn: async () => {
      const response = await tuyau
        .$route('api.v1.responsavel.api.studentBalance', { studentId })
        .$get()
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar saldo')
      }
      return response.data
    },
    enabled: !!studentId,
  }
}

function BalanceOverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function BalanceOverviewError() {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>Erro ao carregar informações de saldo</AlertDescription>
    </Alert>
  )
}

function BalanceOverviewContent({ studentId }: { studentId: string }) {
  const { data, isLoading, isError, error } = useQuery(useBalanceQueryOptions(studentId))

  if (isLoading) {
    return <BalanceOverviewSkeleton />
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar saldo: {error instanceof Error ? error.message : 'Erro desconhecido'}
        </AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return null
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100)
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Saldo Atual */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(data.summary.currentBalance)}
          </div>
          <p className="text-xs text-muted-foreground">Disponível para uso</p>
        </CardContent>
      </Card>

      {/* Total de Créditos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Créditos</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(data.summary.totalCredits)}
          </div>
          <p className="text-xs text-muted-foreground">Adicionados</p>
        </CardContent>
      </Card>

      {/* Total de Débitos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Débitos</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(data.summary.totalDebits)}
          </div>
          <p className="text-xs text-muted-foreground">Gastos</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function BalanceOverviewContainer({ studentId }: { studentId: string }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar saldo: {error.message}
                <button onClick={resetErrorBoundary} className="ml-2 underline">
                  Tentar novamente
                </button>
              </AlertDescription>
            </Alert>
          )}
        >
          <BalanceOverviewContent studentId={studentId} />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
