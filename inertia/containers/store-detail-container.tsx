import { Link } from '@inertiajs/react'
import { useState } from 'react'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useQuery } from '@tanstack/react-query'
import { useStoreQueryOptions } from '../hooks/queries/use_stores'
import { StoreProductsTab } from './stores/store-products-tab'
import { StoreOrdersTab } from './stores/store-orders-tab'
import { StoreInstallmentRulesTab } from './stores/store-installment-rules-tab'
import { StoreFinancialSettingsTab } from './stores/store-financial-settings-tab'
import { StoreSettlementsTab } from './stores/store-settlements-tab'
import { CreateStoreSaleModal } from './stores/create-store-sale-modal'

interface StoreDetailContainerProps {
  storeId: string
}

export function StoreDetailContainer({ storeId }: StoreDetailContainerProps) {
  const [createSaleOpen, setCreateSaleOpen] = useState(false)
  const { data: store, isLoading } = useQuery(useStoreQueryOptions(storeId))

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>
  }

  if (!store) {
    return <div className="text-center py-8 text-muted-foreground">Loja não encontrada</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/escola/lojas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{store.name}</h1>
              <Badge variant={store.type === 'INTERNAL' ? 'default' : 'secondary'}>
                {store.type === 'INTERNAL' ? 'Interna' : 'Terceirizada'}
              </Badge>
              <Badge variant={store.isActive ? 'default' : 'outline'}>
                {store.isActive ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
            {store.description && <p className="text-muted-foreground">{store.description}</p>}
          </div>
        </div>

        <Button onClick={() => setCreateSaleOpen(true)}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Nova venda
        </Button>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="installment-rules">Parcelamento</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          {store.type === 'THIRD_PARTY' && <TabsTrigger value="settlements">Repasses</TabsTrigger>}
        </TabsList>

        <TabsContent value="products">
          <StoreProductsTab storeId={storeId} />
        </TabsContent>

        <TabsContent value="orders">
          <StoreOrdersTab storeId={storeId} />
        </TabsContent>

        <TabsContent value="installment-rules">
          <StoreInstallmentRulesTab storeId={storeId} />
        </TabsContent>

        <TabsContent value="financial">
          <StoreFinancialSettingsTab storeId={storeId} />
        </TabsContent>

        {store.type === 'THIRD_PARTY' && (
          <TabsContent value="settlements">
            <StoreSettlementsTab storeId={storeId} />
          </TabsContent>
        )}
      </Tabs>

      <CreateStoreSaleModal
        open={createSaleOpen}
        onOpenChange={setCreateSaleOpen}
        storeId={storeId}
        schoolId={store.schoolId}
      />
    </div>
  )
}
