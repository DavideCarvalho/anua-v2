import { Head, usePage } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { CanteenContextBar } from '../../../components/cantina/canteen-context-bar'
import { CanteenPurchasesContainer } from '../../../containers/canteen-purchases-container'
import type { SharedProps } from '../../../lib/types'

interface PageProps extends SharedProps {
  canteenId?: string | null
}

export default function CantinaPedidosPage() {
  const { props } = usePage<PageProps>()

  return (
    <EscolaLayout>
      <Head title="Pedidos da Cantina" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Acompanhe e gerencie os pedidos da cantina</p>
        </div>

        <CanteenContextBar />

        <CanteenPurchasesContainer canteenId={props.canteenId ?? undefined} />
      </div>
    </EscolaLayout>
  )
}
