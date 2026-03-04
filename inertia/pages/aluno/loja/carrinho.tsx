import { Head, usePage } from '@inertiajs/react'
import { Backpack } from 'lucide-react'
import { AlunoLayout } from '../../../components/layouts/aluno-layout'
import { MarketplaceCartContainer } from '../../../containers/marketplace-cart-container'
import { GamifiedCartContainer } from '../../../containers/gamificacao/gamified-cart-container'
import type { SharedProps } from '../../../lib/types'

export default function AlunoCarrinhoPage() {
  const { props } = usePage<SharedProps>()
  const gamified = props.gamified ?? false

  return (
    <AlunoLayout>
      <Head title={gamified ? 'Mochila' : 'Carrinho'} />
      <div className="space-y-6">
        <div>
          <h1 className={gamified ? 'flex items-center gap-2 font-display text-2xl font-bold text-gf-primary-dark dark:text-gf-primary-light' : 'text-2xl font-bold tracking-tight'}>
            {gamified && <Backpack className="size-6" />}
            {gamified ? 'Mochila' : 'Carrinho'}
          </h1>
          <p className={gamified ? 'font-body text-sm text-muted-foreground' : 'text-muted-foreground'}>
            {gamified ? 'Confira os itens que você escolheu!' : 'Revise seus itens e finalize a compra'}
          </p>
        </div>
        {gamified ? <GamifiedCartContainer /> : <MarketplaceCartContainer />}
      </div>
    </AlunoLayout>
  )
}
