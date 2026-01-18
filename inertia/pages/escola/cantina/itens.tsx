import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { CanteenItemsContainer } from '../../../containers/canteen-items-container'

export default function CantinaItensPage() {
  return (
    <EscolaLayout>
      <Head title="Itens da Cantina" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Itens da Cantina</h1>
          <p className="text-muted-foreground">
            Gerencie os produtos disponíveis na cantina
          </p>
        </div>

        <CanteenItemsContainer />
      </div>
    </EscolaLayout>
  )
}
