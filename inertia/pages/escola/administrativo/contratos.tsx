import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { ContractsListContainer } from '../../../containers/contracts-list-container'

export default function ContratosPage() {
  return (
    <EscolaLayout>
      <Head title="Contratos" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contratos</h1>
          <p className="text-muted-foreground">
            Gerencie os modelos de contrato da escola
          </p>
        </div>

        <ContractsListContainer />
      </div>
    </EscolaLayout>
  )
}
