import { useState } from 'react'
import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { ArrowUpCircle, ArrowDownCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { tuyau } from '../../lib/api'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { AlertCircle } from 'lucide-react'

function useBalanceQueryOptions(studentId: string, page: number = 1) {
  return {
    queryKey: ['responsavel', 'student', studentId, 'transactions', page],
    queryFn: async () => {
      const response = await tuyau
        .$route('api.v1.responsavel.api.studentBalance', { studentId })
        .$get({ query: { page, limit: 20 } })
      if (response.error) {
        throw new Error((response.error as any).value?.message || 'Erro ao carregar transacoes')
      }
      return response.data
    },
    enabled: !!studentId,
  }
}

function TransactionsHistorySkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TransactionsHistoryContent({ studentId }: { studentId: string }) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error } = useQuery(useBalanceQueryOptions(studentId, page))

  if (isLoading) {
    return <TransactionsHistorySkeleton />
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar transações: {error instanceof Error ? error.message : 'Erro desconhecido'}
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

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; variant: 'default' | 'destructive' | 'secondary' }
    > = {
      COMPLETED: { label: 'Concluída', variant: 'default' },
      PENDING: { label: 'Pendente', variant: 'secondary' },
      FAILED: { label: 'Falhou', variant: 'destructive' },
    }

    const config = statusConfig[status] ?? { label: status, variant: 'secondary' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Transações</CardTitle>
      </CardHeader>
      <CardContent>
        {data.data.length > 0 ? (
          <div className="space-y-3">
            {data.data.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  {transaction.type === 'CREDIT' ? (
                    <ArrowUpCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(String(transaction.createdAt))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'CREDIT' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {data.meta && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Página {data.meta.currentPage} de {data.meta.lastPage}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={data.meta.currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={data.meta.currentPage === data.meta.lastPage}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma transação</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Ainda não há transações registradas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function TransactionsHistoryContainer({ studentId }: { studentId: string }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar transações: {(error as Error).message}
                <button onClick={resetErrorBoundary} className="ml-2 underline">
                  Tentar novamente
                </button>
              </AlertDescription>
            </Alert>
          )}
        >
          <TransactionsHistoryContent studentId={studentId} />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
