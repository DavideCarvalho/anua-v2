import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { Clock, Receipt, UtensilsCrossed } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import type { Route } from '@tuyau/core/types'
import { api } from '~/lib/api'

type ResponsavelStudentCanteenPurchasesResponse =
  Route.Response<'api.v1.responsavel.api.student_canteen_purchases'>

type ResponsavelCanteenPurchase = ResponsavelStudentCanteenPurchasesResponse['data'][number]

const paymentMethodLabels: Record<string, string> = {
  BALANCE: 'Saldo',
  CASH: 'Dinheiro',
  CARD: 'Cartão',
  PIX: 'PIX',
  ON_ACCOUNT: 'Fiado',
  PIX_MACHINE: 'PIX (máquina)',
  CARD_MACHINE: 'Cartão (máquina)',
}

function getStatusBadge(status: string) {
  const statusConfig: Record<
    string,
    { label: string; variant: 'default' | 'destructive' | 'secondary' }
  > = {
    PAID: { label: 'Pago', variant: 'default' },
    PENDING: { label: 'Pendente', variant: 'secondary' },
    CANCELLED: { label: 'Cancelado', variant: 'destructive' },
  }

  const config = statusConfig[status] ?? { label: status, variant: 'secondary' as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function StudentCanteenPurchasesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-56 animate-pulse rounded bg-muted" />
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

function StudentCanteenPurchasesContent({ studentId }: { studentId: string }) {
  const { data, isLoading, isError, error } = useQuery(
    api.api.v1.responsavel.api.studentCanteenPurchases.queryOptions({
      params: { studentId },
    })
  )

  if (isLoading) {
    return <StudentCanteenPurchasesSkeleton />
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar compras da cantina:{' '}
          {error instanceof Error ? error.message : 'Erro desconhecido'}
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
          <Receipt className="h-5 w-5" />
          Histórico de Compras da Cantina
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.data.length > 0 ? (
          <div className="space-y-3">
            {data.data.map((purchase: ResponsavelCanteenPurchase) => (
              <div key={purchase.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Compra #{purchase.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(String(purchase.createdAt)).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(purchase.totalAmount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {paymentMethodLabels[purchase.paymentMethod] ?? purchase.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">-</span>
                  {getStatusBadge(purchase.status)}
                </div>
              </div>
            ))}

            {data.metadata && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-muted-foreground">
                  Página {data.metadata.currentPage} de {data.metadata.lastPage}
                </p>
                <span className="text-xs text-muted-foreground">Paginação disponível em breve</span>
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma compra encontrada</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              As compras da cantina aparecerão aqui.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function StudentCanteenPurchasesContainer({ studentId }: { studentId: string }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar compras da cantina: {(error as Error).message}
                <button onClick={resetErrorBoundary} className="ml-2 underline">
                  Tentar novamente
                </button>
              </AlertDescription>
            </Alert>
          )}
        >
          <StudentCanteenPurchasesContent studentId={studentId} />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export function StudentCanteenPurchasesEmptyState() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <UtensilsCrossed className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum aluno selecionado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Selecione um aluno para ver histórico e saldo da cantina.
        </p>
      </CardContent>
    </Card>
  )
}
