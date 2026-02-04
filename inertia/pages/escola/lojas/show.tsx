import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { StoreDetailContainer } from '../../../containers/store-detail-container'

interface Props {
  storeId: string
}

export default function LojaDetailPage({ storeId }: Props) {
  return (
    <EscolaLayout>
      <Head title="Detalhe da Loja" />
      <StoreDetailContainer storeId={storeId} />
    </EscolaLayout>
  )
}
