import { Head } from '@inertiajs/react'
import { AdminLayout } from '../../../components/layouts'
import { DashboardFilters } from '../../../containers/admin-analytics/shared'
import { HrOverviewCards, HrBySchoolChart } from '../../../containers/admin-analytics/hr'

export default function AdminAnalyticsRh() {
  return (
    <AdminLayout>
      <Head title="Analytics - RH" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard de RH</h1>
            <p className="text-muted-foreground">
              Funcionários, professores e registros de ponto
            </p>
          </div>
        </div>

        <DashboardFilters />

        <HrOverviewCards />

        <HrBySchoolChart />
      </div>
    </AdminLayout>
  )
}
