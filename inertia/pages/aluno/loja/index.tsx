import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../../components/layouts/aluno-layout'
import { MarketplaceStoresContainer } from '../../../containers/marketplace-stores-container'

export default function AlunoLojaPage() {
  return (
    <AlunoLayout>
      <Head title="Loja" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Loja</h1>
          <p className="text-muted-foreground">Explore as lojas disponíveis</p>
        </div>
        <MarketplaceStoresContainer />
      </div>
    </AlunoLayout>
  )
}
