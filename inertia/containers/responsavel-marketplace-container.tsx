import { usePage } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { useMarketplaceStoresQueryOptions, type MarketplaceStoresResponse } from '../hooks/queries/use_marketplace'

type MarketplaceStore = NonNullable<MarketplaceStoresResponse>['data'][number]
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ShoppingBag } from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import type { SharedProps } from '../lib/types'

export function ResponsavelMarketplaceContainer() {
  const { url } = usePage<SharedProps>()

  let selectedStudentId: string | undefined
  try {
    const urlObj =
      typeof window !== 'undefined'
        ? new URL(url, window.location.origin)
        : new URL(`http://localhost${url}`)
    selectedStudentId = urlObj.searchParams.get('aluno') ?? undefined
  } catch {
    const match = url.match(/[?&]aluno=([^&]+)/)
    selectedStudentId = match ? match[1] : undefined
  }

  const { data, isLoading } = useQuery(useMarketplaceStoresQueryOptions(selectedStudentId))
  const stores: MarketplaceStore[] = data?.data ?? []

  if (!selectedStudentId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          Selecione um aluno no topo da página para ver as lojas disponíveis
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Carregando lojas...</p>
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          Nenhuma loja disponível para este aluno
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stores.map((store) => (
        <a key={store.id} href={'/responsavel/loja/' + store.id}>
          <Card className="transition-colors hover:border-primary/50 cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{store.name}</CardTitle>
                <Badge variant={store.type === 'INTERNAL' ? 'default' : 'secondary'}>
                  {store.type === 'INTERNAL' ? 'Interna' : 'Terceirizada'}
                </Badge>
              </div>
              {store.description && (
                <CardDescription>{store.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {store.schoolName && (
                <p className="text-sm text-muted-foreground">{store.schoolName}</p>
              )}
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  )
}
