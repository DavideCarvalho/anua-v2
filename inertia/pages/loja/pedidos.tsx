import { Head } from '@inertiajs/react'
import { LojaLayout } from '../../components/layouts/loja-layout'
import { StoreOwnerOrdersContainer } from '../../containers/store-owner-orders-container'

export default function LojaPedidosPage() {
  return (
    <LojaLayout>
      <Head title="Pedidos" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Gerencie os pedidos da sua loja</p>
        </div>
        <StoreOwnerOrdersContainer />
      </div>
    </LojaLayout>
  )
}
