import { useMemo } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { ResponsavelLayout } from '../../../components/layouts/responsavel-layout'
import { CartProvider } from '../../../contexts/cart-context'
import { MarketplaceStoreDetailContainer } from '../../../containers/marketplace-store-detail-container'

export default function ResponsavelLojaStorePage() {
  const { props, url } = usePage<{ storeId: string }>()

  // Get studentId from URL query param
  const studentId = useMemo(() => {
    try {
      const urlObj = typeof window !== 'undefined'
        ? new URL(url, window.location.origin)
        : new URL(`http://localhost${url}`)
      return urlObj.searchParams.get('aluno') ?? undefined
    } catch {
      const match = url.match(/[?&]aluno=([^&]+)/)
      return match ? match[1] : undefined
    }
  }, [url])

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
