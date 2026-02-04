import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../../components/layouts/aluno-layout'
import { MarketplaceOrdersContainer } from '../../../containers/marketplace-orders-container'

export default function AlunoPedidosPage() {
  return (
    <AlunoLayout>
      <Head title="Meus Pedidos" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meus Pedidos</h1>
          <p className="text-muted-foreground">Acompanhe o status dos seus pedidos</p>
        </div>
        <MarketplaceOrdersContainer />
      </div>
    </AlunoLayout>
  )
}
