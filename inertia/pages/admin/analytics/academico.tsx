import { Head } from '@inertiajs/react'
import { AdminLayout } from '../../../components/layouts'
import { DashboardFilters } from '../../../containers/admin-analytics/shared'
import {
  AcademicOverviewCards,
  AtRiskStudentsTable,
  GradeDistributionChart,
} from '../../../containers/admin-analytics/academic'

export default function AdminAnalyticsAcademico() {
  return (
    <AdminLayout>
      <Head title="Analytics - Acadêmico" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Acadêmico</h1>
            <p className="text-muted-foreground">
              Visão geral de desempenho acadêmico e analytics
            </p>
          </div>
        </div>

        <DashboardFilters />

        <AcademicOverviewCards />

        <div className="grid gap-6 lg:grid-cols-2">
          <GradeDistributionChart />
          <AtRiskStudentsTable />
        </div>
      </div>
    </AdminLayout>
  )
}
