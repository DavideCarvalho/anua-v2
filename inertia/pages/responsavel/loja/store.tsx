import { Head, usePage } from '@inertiajs/react'
import { ResponsavelLayout } from '../../../components/layouts/responsavel-layout'
import { CartProvider } from '../../../contexts/cart-context'
import { MarketplaceStoreDetailContainer } from '../../../containers/marketplace-store-detail-container'

export default function ResponsavelLojaStorePage() {
  const { props } = usePage<{ storeId: string }>()
  return (
    <ResponsavelLayout>
      <Head title="Loja" />
      <CartProvider>
        <MarketplaceStoreDetailContainer storeId={props.storeId} backHref="/responsavel/loja" />
      </CartProvider>
    </ResponsavelLayout>
  )
}
