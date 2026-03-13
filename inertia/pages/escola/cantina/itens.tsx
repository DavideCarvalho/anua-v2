import { Head, usePage } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { CanteenGate } from '../../../components/cantina/canteen-gate'
import { CanteenItemsContainer } from '../../../containers/canteen-items-container'
import type { SharedProps } from '../../../lib/types'

interface PageProps extends SharedProps {
  canteenId?: string | null
}

export default function CantinaItensPage() {
  const { props } = usePage<PageProps>()

  return (
    <EscolaLayout>
      <Head title="Itens da Cantina" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Itens da Cantina</h1>
          <p className="text-muted-foreground">Gerencie os produtos disponíveis na cantina</p>
        </div>

        <CanteenGate>
          <CanteenItemsContainer canteenId={props.canteenId ?? undefined} />
        </CanteenGate>
      </div>
    </EscolaLayout>
  )
}
