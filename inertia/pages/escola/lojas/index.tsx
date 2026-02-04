import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { StoreListContainer } from '../../../containers/store-list-container'

export default function LojasPage() {
  return (
    <EscolaLayout>
      <Head title="Lojas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lojas</h1>
          <p className="text-muted-foreground">
            Gerencie as lojas da instituicao
          </p>
        </div>

        <StoreListContainer />
      </div>
    </EscolaLayout>
  )
}
