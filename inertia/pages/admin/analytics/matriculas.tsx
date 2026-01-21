import { Head } from '@inertiajs/react'
import { AdminLayout } from '../../../components/layouts'
import { DashboardFilters } from '../../../containers/admin-analytics/shared'
import {
  EnrollmentsOverviewCards,
  EnrollmentsByLevelChart,
} from '../../../containers/admin-analytics/enrollments'

export default function AdminAnalyticsMatriculas() {
  return (
    <AdminLayout>
      <Head title="Analytics - Matrículas" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard de Matrículas</h1>
            <p className="text-muted-foreground">
              Alunos por período, curso e status de matrícula
            </p>
          </div>
        </div>

        <DashboardFilters />

        <EnrollmentsOverviewCards />

        <EnrollmentsByLevelChart />
      </div>
    </AdminLayout>
  )
}
