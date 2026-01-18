import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { CanteenPurchasesContainer } from '../../../containers/canteen-purchases-container'

export default function CantinaPedidosPage() {
  return (
    <EscolaLayout>
      <Head title="Pedidos da Cantina" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">
            Acompanhe e gerencie os pedidos da cantina
          </p>
        </div>

        <CanteenPurchasesContainer />
      </div>
    </EscolaLayout>
  )
}
