import { Head } from '@inertiajs/react'
import { LojaLayout } from '../../components/layouts/loja-layout'
import { StoreOwnerProductsContainer } from '../../containers/store-owner-products-container'

export default function LojaProdutosPage() {
  return (
    <LojaLayout>
      <Head title="Produtos" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Gerencie os produtos da sua loja</p>
        </div>
        <StoreOwnerProductsContainer />
      </div>
    </LojaLayout>
  )
}
