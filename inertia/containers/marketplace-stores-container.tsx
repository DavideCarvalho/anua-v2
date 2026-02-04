import { useQuery } from '@tanstack/react-query'
import { Link } from '@tuyau/inertia/react'
import { ShoppingBag, Store as StoreIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useMarketplaceStoresQueryOptions } from '../hooks/queries/use_marketplace'

export function MarketplaceStoresContainer() {
  const { data, isLoading } = useQuery(useMarketplaceStoresQueryOptions())

  const stores = (data as any)?.data ?? []

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">Carregando...</div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Nenhuma loja encontrada</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Não há lojas disponíveis no momento
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stores.map((store: any) => (
        <Link
          key={store.id}
          route={'web.aluno.loja.store' as any}
          params={{ id: store.id } as any}
        >
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StoreIcon className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{store.name}</CardTitle>
                </div>
                <Badge variant={store.type === 'INTERNAL' ? 'default' : 'secondary'}>
                  {store.type === 'INTERNAL' ? 'Interna' : 'Terceirizada'}
                </Badge>
              </div>
              {store.description && (
                <CardDescription>{store.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{store.school?.name}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
