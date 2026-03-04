import { Head, usePage } from '@inertiajs/react'
import { AlunoLayout } from '../../../components/layouts/aluno-layout'
import { MarketplaceStoresContainer } from '../../../containers/marketplace-stores-container'
import { GamifiedMarketplaceStores } from '../../../containers/gamificacao/gamified-marketplace-stores'
import type { SharedProps } from '../../../lib/types'

export default function AlunoLojaPage() {
  const { props } = usePage<SharedProps>()
  const gamified = props.gamified ?? false

  return (
    <AlunoLayout>
      <Head title={gamified ? 'Mercadinho' : 'Loja'} />
      <div className="space-y-6">
        <div>
          <h1 className={gamified ? 'font-display text-2xl font-bold text-gf-primary-dark dark:text-gf-primary-light' : 'text-2xl font-bold tracking-tight'}>
            {gamified ? 'Mercadinho' : 'Loja'}
          </h1>
          <p className={gamified ? 'font-body text-sm text-muted-foreground' : 'text-muted-foreground'}>
            {gamified ? 'Explore as barraquinhas e descubra coisas legais!' : 'Explore as lojas disponíveis'}
          </p>
        </div>
        {gamified ? <GamifiedMarketplaceStores /> : <MarketplaceStoresContainer />}
      </div>
    </AlunoLayout>
  )
}
