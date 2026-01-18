import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { CanteenPurchasesContainer } from '../../../containers/canteen-purchases-container'

export default function VendasPage() {
  return (
    <EscolaLayout>
      <Head title="Vendas da Cantina" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendas</h1>
          <p className="text-muted-foreground">
            Histórico de vendas da cantina
          </p>
        </div>

        <CanteenPurchasesContainer />
      </div>
    </EscolaLayout>
  )
}
