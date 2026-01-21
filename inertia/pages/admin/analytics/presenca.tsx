import { Head } from '@inertiajs/react'
import { AdminLayout } from '../../../components/layouts'
import { DashboardFilters } from '../../../containers/admin-analytics/shared'
import {
  AttendanceOverviewCards,
  AttendanceTrendsChart,
  ChronicAbsenteeismTable,
} from '../../../containers/admin-analytics/attendance'

export default function AdminAnalyticsPresenca() {
  return (
    <AdminLayout>
      <Head title="Analytics - Presença" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard de Presença</h1>
            <p className="text-muted-foreground">
              Visão geral e analytics de frequência dos estudantes
            </p>
          </div>
        </div>

        <DashboardFilters />

        <AttendanceOverviewCards />

        <div className="grid gap-6 lg:grid-cols-2">
          <AttendanceTrendsChart />
          <ChronicAbsenteeismTable />
        </div>
      </div>
    </AdminLayout>
  )
}
