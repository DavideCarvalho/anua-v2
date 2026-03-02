import { Head } from '@inertiajs/react'
import { useState } from 'react'
import { Gift, ShoppingCart, Package, AlertCircle } from 'lucide-react'
import { ErrorBoundary } from 'react-error-boundary'

import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { StoreItemsTable } from '../../../containers/gamificacao/store-items-table'
import { StoreOrdersTable } from '../../../containers/gamificacao/store-orders-table'
import { useAuthUser } from '../../../stores/auth_store'

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: unknown
  resetErrorBoundary: () => void
}) {
  const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado'
  return (
    <Card className="border-destructive">
      <CardContent className="flex flex-col items-center gap-4 py-10">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="font-semibold text-destructive">Erro ao carregar recompensas</h3>
          <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
        </div>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}

export default function RecompensasPage() {
  const user = useAuthUser()
  const schoolId = user?.schoolId
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
          <p className="text-muted-foreground">Gerencie itens e pedidos da loja de pontos</p>
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
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <StoreItemsTable schoolId={schoolId} />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <StoreOrdersTable schoolId={schoolId} />
              </ErrorBoundary>
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
