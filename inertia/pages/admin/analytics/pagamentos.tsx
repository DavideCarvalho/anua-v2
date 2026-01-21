import { Head } from '@inertiajs/react'
import { AdminLayout } from '../../../components/layouts'
import { DashboardFilters } from '../../../containers/admin-analytics/shared'
import { PaymentsOverviewCards } from '../../../containers/admin-analytics/payments'

export default function AdminAnalyticsPagamentos() {
  return (
    <AdminLayout>
      <Head title="Analytics - Pagamentos" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard de Pagamentos</h1>
            <p className="text-muted-foreground">
              Mensalidades, inadimplência e recebimentos
            </p>
          </div>
        </div>

        <DashboardFilters />

        <PaymentsOverviewCards />
      </div>
    </AdminLayout>
  )
}
