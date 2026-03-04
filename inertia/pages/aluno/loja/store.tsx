import { Head, usePage } from '@inertiajs/react'
import { AlunoLayout } from '../../../components/layouts/aluno-layout'
import { MarketplaceStoreDetailContainer } from '../../../containers/marketplace-store-detail-container'
import type { SharedProps } from '../../../lib/types'

export default function AlunoLojaStorePage() {
  const { props } = usePage<{ storeId: string } & SharedProps>()
  const gamified = props.gamified ?? false

  return (
    <AlunoLayout>
      <Head title={gamified ? 'Mercadinho' : 'Loja'} />
      <MarketplaceStoreDetailContainer storeId={props.storeId} />
    </AlunoLayout>
  )
}
