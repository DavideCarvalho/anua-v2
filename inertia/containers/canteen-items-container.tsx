import { Suspense, useState } from 'react'
import { useSuspenseQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useCanteenItemsQueryOptions } from '../hooks/queries/use-canteen-items'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  MoreHorizontal,
  Plus,
} from 'lucide-react'

// Loading Skeleton
function CanteenItemsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        <div className="h-10 w-32 bg-muted animate-pulse rounded ml-auto" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-32 bg-muted animate-pulse rounded mb-3" />
              <div className="h-5 w-24 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Error Fallback
function CanteenItemsError({
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
          <h3 className="font-semibold text-destructive">Erro ao carregar itens</h3>
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
function CanteenItemsContent({ page, onPageChange }: { page: number; onPageChange: (page: number) => void }) {
  const { data } = useSuspenseQuery(useCanteenItemsQueryOptions({ page, limit: 20 }))

  const items = Array.isArray(data) ? data : data?.data || []
  const meta = !Array.isArray(data) && data?.meta ? data.meta : null

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Nenhum item cadastrado</h3>
          <p className="text-sm text-muted-foreground mt-1">Cadastre o primeiro item da cantina</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item: any) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="h-32 bg-muted rounded mb-3 flex items-center justify-center">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover rounded"
                  />
                ) : (
                  <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-lg font-bold text-primary">
                    R$ {Number(item.price || 0).toFixed(2)}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {item.active ? 'Disponível' : 'Indisponível'}
                </span>
                {item.stock !== null && item.stock !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    Estoque: {item.stock}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {meta && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {items.length} de {meta.total} itens
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
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
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Container Export
export function CanteenItemsContainer() {
  const [page, setPage] = useState(1)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar itens..." className="pl-9" />
        </div>
        <Button className="ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>

      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ error, resetErrorBoundary }) => (
              <CanteenItemsError error={error} resetErrorBoundary={resetErrorBoundary} />
            )}
          >
            <Suspense fallback={<CanteenItemsSkeleton />}>
              <CanteenItemsContent page={page} onPageChange={setPage} />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </div>
  )
}
