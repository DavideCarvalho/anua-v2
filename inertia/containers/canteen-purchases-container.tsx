import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import { useCanteenPurchasesQueryOptions } from '../hooks/queries/use_canteen_purchases'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'

// Loading Skeleton
function CanteenPurchasesSkeleton() {
  return (
    <div className="border rounded-lg">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="p-4 border-b last:border-0">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Error Fallback
function CanteenPurchasesErrorFallback({
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
          <h3 className="font-semibold text-destructive">Erro ao carregar pedidos</h3>
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

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
  preparing: { label: 'Preparando', className: 'bg-blue-100 text-blue-700', icon: Clock },
  ready: { label: 'Pronto', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  delivered: { label: 'Entregue', className: 'bg-gray-100 text-gray-700', icon: CheckCircle },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700', icon: XCircle },
}

// Container Export
export function CanteenPurchasesContainer() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <CanteenPurchasesErrorFallback error={error as Error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <CanteenPurchasesContent />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

function CanteenPurchasesContent() {
  // URL state with nuqs
  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  })

  const { search, page, limit } = filters

  const { data, isLoading, error, refetch } = useQuery(
    useCanteenPurchasesQueryOptions({ page, limit, search: search || undefined })
  )

  const result = data as any
  const purchases = Array.isArray(result) ? result : result?.data || []
  const meta = !Array.isArray(result) && result?.meta ? result.meta : null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pedidos..."
            className="pl-9"
            value={search || ''}
            onChange={(e) => setFilters({ search: e.target.value || null, page: 1 })}
          />
        </div>
      </div>

      {isLoading && <CanteenPurchasesSkeleton />}

      {error && (
        <CanteenPurchasesErrorFallback error={error} resetErrorBoundary={() => refetch()} />
      )}

      {!isLoading && !error && purchases.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhum pedido encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">Os pedidos da cantina aparecerão aqui</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && purchases.length > 0 && (
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Pedido</th>
                  <th className="text-left p-4 font-medium">Aluno</th>
                  <th className="text-left p-4 font-medium">Itens</th>
                  <th className="text-left p-4 font-medium">Total</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase: any) => {
                  const status = statusConfig[purchase.status] || statusConfig.pending
                  const StatusIcon = status.icon

                  return (
                    <tr key={purchase.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-sm">#{purchase.id.slice(0, 8)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                            {purchase.user?.name?.charAt(0) || 'U'}
                          </div>
                          <span className="font-medium">{purchase.user?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{purchase.items?.length || 0} item(s)</td>
                      <td className="p-4 font-semibold">R$ {Number(purchase.total || 0).toFixed(2)}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {meta && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {purchases.length} de {meta.total} pedidos
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
      )}
    </div>
  )
}
