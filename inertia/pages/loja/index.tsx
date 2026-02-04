import { Head } from '@inertiajs/react'
import { LojaLayout } from '../../components/layouts/loja-layout'
import { StoreOwnerDashboardContainer } from '../../containers/store-owner-dashboard-container'

export default function LojaDashboardPage() {
  return (
    <LojaLayout>
      <Head title="Dashboard da Loja" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da sua loja</p>
        </div>
        <StoreOwnerDashboardContainer />
      </div>
    </LojaLayout>
  )
}
