import { Head, usePage } from '@inertiajs/react'
import { ResponsavelLayout } from '../../../components/layouts/responsavel-layout'
import { CartProvider } from '../../../contexts/cart-context'
import { MarketplaceStoreDetailContainer } from '../../../containers/marketplace-store-detail-container'
import { useSelectedStudent } from '../../../hooks/use_selected_student'

export default function ResponsavelLojaStorePage() {
  const { props } = usePage<{ storeId: string }>()
  const { studentId } = useSelectedStudent()

  return (
    <ResponsavelLayout>
      <Head title="Loja" />
      <CartProvider>
        <MarketplaceStoreDetailContainer
          storeId={props.storeId}
          backHref="/responsavel/loja"
          studentId={studentId}
        />
      </CartProvider>
    </ResponsavelLayout>
  )
}
