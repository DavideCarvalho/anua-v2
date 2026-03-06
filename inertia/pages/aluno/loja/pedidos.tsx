import { Head, usePage } from '@inertiajs/react'
import { Mail } from 'lucide-react'
import { AlunoLayout } from '../../../components/layouts/aluno-layout'
import { MarketplaceOrdersContainer } from '../../../containers/marketplace-orders-container'
import { GamifiedOrdersContainer } from '../../../containers/gamificacao/gamified-orders-container'
import type { SharedProps } from '../../../lib/types'

export default function AlunoPedidosPage() {
  const { props } = usePage<SharedProps>()
  const gamified = props.gamified ?? false

  return (
    <AlunoLayout>
      <Head title={gamified ? 'Correio' : 'Meus Pedidos'} />
      <div className="space-y-6">
        <div>
          <h1
            className={
              gamified
                ? 'flex items-center gap-2 font-display text-2xl font-bold text-gf-primary-dark dark:text-gf-primary-light'
                : 'text-2xl font-bold tracking-tight'
            }
          >
            {gamified && <Mail className="size-6" />}
            {gamified ? 'Correio' : 'Meus Pedidos'}
          </h1>
          <p
            className={
              gamified ? 'font-body text-sm text-muted-foreground' : 'text-muted-foreground'
            }
          >
            {gamified ? 'Acompanhe suas encomendas!' : 'Acompanhe o status dos seus pedidos'}
          </p>
        </div>
        {gamified ? <GamifiedOrdersContainer /> : <MarketplaceOrdersContainer />}
      </div>
    </AlunoLayout>
  )
}
