import { useQuery } from '@tanstack/react-query'
import { Link } from '@tuyau/inertia/react'
import { ShoppingCart, Plus, Minus, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { useMarketplaceItemsQueryOptions } from '../hooks/queries/use_marketplace'
import { useCart } from '../contexts/cart-context'
import { formatCurrency } from '../lib/utils'

const CATEGORY_LABELS: Record<string, string> = {
  CANTEEN_FOOD: 'Alimento',
  CANTEEN_DRINK: 'Bebida',
  SCHOOL_SUPPLY: 'Material',
  PRIVILEGE: 'Privilégio',
  HOMEWORK_PASS: 'Passe Tarefa',
  UNIFORM: 'Uniforme',
  BOOK: 'Livro',
  MERCHANDISE: 'Mercadoria',
  DIGITAL: 'Digital',
  OTHER: 'Outro',
}

export function MarketplaceStoreDetailContainer({ storeId }: { storeId: string }) {
  const { data, isLoading } = useQuery(useMarketplaceItemsQueryOptions(storeId))
  const cart = useCart()

  const items = (data as any)?.data ?? []

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">Carregando...</div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          route={'web.aluno.loja.index' as any}
          params={undefined as any}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para lojas
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Nenhum produto disponível</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((product: any) => {
            const inCart = cart.items.find((i) => i.storeItemId === product.id)

            return (
              <Card key={product.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-medium">
                      {product.name}
                    </CardTitle>
                    {product.category && (
                      <Badge variant="secondary" className="shrink-0">
                        {CATEGORY_LABELS[product.category] ?? product.category}
                      </Badge>
                    )}
                  </div>
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="flex flex-col gap-3 mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      {formatCurrency(product.price)}
                    </span>
                    {product.totalStock !== null && product.totalStock !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        Estoque: {product.totalStock}
                      </span>
                    )}
                  </div>

                  {inCart ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          cart.updateQuantity(product.id, inCart.quantity - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {inCart.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          cart.addItem({
                            storeItemId: product.id,
                            storeId,
                            storeName: '',
                            name: product.name,
                            price: product.price,
                            imageUrl: product.imageUrl ?? null,
                          })
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        cart.addItem({
                          storeItemId: product.id,
                          storeId,
                          storeName: '',
                          name: product.name,
                          price: product.price,
                          imageUrl: product.imageUrl ?? null,
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
