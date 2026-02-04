import { useState } from 'react'
import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { CreditCard, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { AlertCircle } from 'lucide-react'
import {
  useWalletTopUpsQueryOptions,
  type WalletTopUpsResponse,
} from '../../hooks/queries/use_wallet_topups'
import { formatCurrency } from '../../lib/utils'

const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

const paymentMethodLabels: Record<string, string> = {
  PIX: 'PIX',
  BOLETO: 'Boleto',
}

function getPaymentMethodLabel(method: string | null): string {
  if (!method) return '-'
  return paymentMethodLabels[method] ?? method
}

function getStatusBadge(status: string) {
  const statusConfig: Record<
    string,
    { label: string; variant: 'default' | 'destructive' | 'secondary' }
  > = {
    PENDING: { label: 'Pendente', variant: 'secondary' },
    PAID: { label: 'Pago', variant: 'default' },
    FAILED: { label: 'Falhou', variant: 'destructive' },
    CANCELLED: { label: 'Cancelado', variant: 'destructive' },
  }

  const config = statusConfig[status] ?? { label: status, variant: 'secondary' as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function TopUpHistorySkeleton() {
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

function TopUpHistoryContent({ studentId }: { studentId: string }) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error } = useQuery(
    useWalletTopUpsQueryOptions({ studentId, page, limit: 10 })
  )

  if (isLoading) {
    return <TopUpHistorySkeleton />
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar recargas: {error instanceof Error ? error.message : 'Erro desconhecido'}
        </AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Histórico de Recargas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.data.length > 0 ? (
          <div className="space-y-3">
            {data.data.map((topUp) => (
              <div
                key={topUp.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">{getPaymentMethodLabel(topUp.paymentMethod)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(String(topUp.createdAt))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-green-600">+{formatCurrency(topUp.amount)}</p>
                    {getStatusBadge(topUp.status)}
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
            <h3 className="mt-4 text-lg font-semibold">Nenhuma recarga</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Ainda não há recargas registradas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function TopUpHistoryContainer({ studentId }: { studentId: string }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar recargas: {(error as Error).message}
                <button onClick={resetErrorBoundary} className="ml-2 underline">
                  Tentar novamente
                </button>
              </AlertDescription>
            </Alert>
          )}
        >
          <TopUpHistoryContent studentId={studentId} />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
