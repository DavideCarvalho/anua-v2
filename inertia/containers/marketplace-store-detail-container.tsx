import { useQuery } from '@tanstack/react-query'
import { Link } from '@inertiajs/react'
import { ShoppingCart, Plus, Minus, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet'
import {
  useMarketplaceItemsQueryOptions,
  type MarketplaceItemsResponse,
} from '../hooks/queries/use_marketplace'
import { useCart } from '../contexts/cart-context'
import { CartSheetContent } from './marketplace-cart-sheet-content'
import { formatCurrency } from '../lib/utils'

type MarketplaceItem = NonNullable<MarketplaceItemsResponse>['data'][number]

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

interface MarketplaceStoreDetailContainerProps {
  storeId: string
  backHref?: string
  studentId?: string
}

export function MarketplaceStoreDetailContainer({ storeId, backHref = '/aluno/loja', studentId }: MarketplaceStoreDetailContainerProps) {
  const { data, isLoading } = useQuery(useMarketplaceItemsQueryOptions(storeId))
  const cart = useCart()

  const items: MarketplaceItem[] = data?.data ?? []
  const hasOnlinePayment: boolean = (data as any)?.hasOnlinePayment ?? false

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">Carregando...</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para lojas
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
        </div>

        {cart.totalItems > 0 && (
          <Sheet>
            <SheetTrigger asChild>
              <Button className="relative gap-2">
                <ShoppingCart className="h-4 w-4" />
                Carrinho
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                  {cart.totalItems}
                </Badge>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
              <SheetHeader className="px-6 py-4 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrinho ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'itens'})
                </SheetTitle>
              </SheetHeader>
              <CartSheetContent backHref={backHref} hasOnlinePayment={hasOnlinePayment} studentId={studentId} />
            </SheetContent>
          </Sheet>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Nenhum produto disponível</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((product) => {
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
