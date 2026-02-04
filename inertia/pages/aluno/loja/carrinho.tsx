import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../../components/layouts/aluno-layout'
import { MarketplaceCartContainer } from '../../../containers/marketplace-cart-container'

export default function AlunoCarrinhoPage() {
  return (
    <AlunoLayout>
      <Head title="Carrinho" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Carrinho</h1>
          <p className="text-muted-foreground">Revise seus itens e finalize a compra</p>
        </div>
        <MarketplaceCartContainer />
      </div>
    </AlunoLayout>
  )
}
