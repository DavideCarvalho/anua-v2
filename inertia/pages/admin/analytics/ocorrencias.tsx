import { Head } from '@inertiajs/react'
import { AdminLayout } from '../../../components/layouts'
import { DashboardFilters } from '../../../containers/admin-analytics/shared'
import {
  IncidentsOverviewCards,
  IncidentsByTypeChart,
  IncidentsBySchoolTable,
} from '../../../containers/admin-analytics/incidents'

export default function AdminAnalyticsOcorrencias() {
  return (
    <AdminLayout>
      <Head title="Analytics - Ocorrências" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard de Ocorrências</h1>
            <p className="text-muted-foreground">
              Incidentes, registros disciplinares e resoluções
            </p>
          </div>
        </div>

        <DashboardFilters />

        <IncidentsOverviewCards />

        <div className="grid gap-6 lg:grid-cols-2">
          <IncidentsByTypeChart />
          <IncidentsBySchoolTable />
        </div>
      </div>
    </AdminLayout>
  )
}
