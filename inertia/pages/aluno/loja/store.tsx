import { Head, usePage } from '@inertiajs/react'
import { AlunoLayout } from '../../../components/layouts/aluno-layout'
import { MarketplaceStoreDetailContainer } from '../../../containers/marketplace-store-detail-container'

export default function AlunoLojaStorePage() {
  const { props } = usePage<{ storeId: string }>()
  return (
    <AlunoLayout>
      <Head title="Loja" />
      <MarketplaceStoreDetailContainer storeId={props.storeId} />
    </AlunoLayout>
  )
}
