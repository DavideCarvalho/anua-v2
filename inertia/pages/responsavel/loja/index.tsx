import { Head } from '@inertiajs/react'
import { ResponsavelLayout } from '../../../components/layouts/responsavel-layout'
import { ResponsavelMarketplaceContainer } from '../../../containers/responsavel-marketplace-container'

export default function ResponsavelLojaPage() {
  return (
    <ResponsavelLayout>
      <Head title="Loja" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Loja</h1>
          <p className="text-muted-foreground">Explore as lojas disponíveis para seus filhos</p>
        </div>
        <ResponsavelMarketplaceContainer />
      </div>
    </ResponsavelLayout>
  )
}
