import { Head, usePage } from '@inertiajs/react'
import { Suspense, useState } from 'react'
import { Gift, ShoppingCart, Package } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { StoreItemsTable } from '../../../containers/gamificacao/store-items-table'
import { StoreOrdersTable } from '../../../containers/gamificacao/store-orders-table'
import type { SharedProps } from '../../../lib/types'

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function RecompensasPage() {
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.schoolId
  const [activeTab, setActiveTab] = useState('items')

  return (
    <EscolaLayout>
      <Head title="Recompensas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Gift className="h-6 w-6" />
            Loja de Recompensas
          </h1>
          <p className="text-muted-foreground">
            Gerencie itens e pedidos da loja de pontos
          </p>
        </div>

        {schoolId ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="items" className="gap-2">
                <Package className="h-4 w-4" />
                Itens
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Pedidos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="mt-6">
              <Suspense fallback={<TableSkeleton />}>
                <StoreItemsTable schoolId={schoolId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <Suspense fallback={<TableSkeleton />}>
                <StoreOrdersTable schoolId={schoolId} />
              </Suspense>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Escola não encontrada no contexto do usuário.
            </CardContent>
          </Card>
        )}
      </div>
    </EscolaLayout>
  )
}
