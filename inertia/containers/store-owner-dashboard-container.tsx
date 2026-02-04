import { useQuery } from '@tanstack/react-query'
import { Package, ShoppingCart, DollarSign, Store } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import {
  useOwnStoreQueryOptions,
  useOwnProductsQueryOptions,
  useOwnOrdersQueryOptions,
} from '../hooks/queries/use_store_owner'

export function StoreOwnerDashboardContainer() {
  const { data: storeData, isLoading: storeLoading } = useQuery(useOwnStoreQueryOptions())
  const { data: productsData } = useQuery(useOwnProductsQueryOptions({ limit: 1 }))
  const { data: pendingOrdersData } = useQuery(
    useOwnOrdersQueryOptions({ status: 'PENDING_APPROVAL', limit: 1 })
  )
  const { data: allOrdersData } = useQuery(useOwnOrdersQueryOptions({ limit: 1 }))

  if (storeLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>
  }

  const store = storeData as any

  return (
    <div className="space-y-6">
      {/* Store info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{store?.name}</CardTitle>
              <CardDescription>{store?.description || 'Sem descrição'}</CardDescription>
            </div>
            <Badge variant={store?.isActive ? 'default' : 'outline'} className="ml-auto">
              {store?.isActive ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(productsData as any)?.meta?.total ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(pendingOrdersData as any)?.meta?.total ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(allOrdersData as any)?.meta?.total ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">pedidos realizados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
