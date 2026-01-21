import { Head } from '@inertiajs/react'
import { AdminLayout } from '../../../components/layouts'
import { DashboardFilters } from '../../../containers/admin-analytics/shared'
import {
  GamificationOverviewCards,
  TopStudentsTable,
} from '../../../containers/admin-analytics/gamification'

export default function AdminAnalyticsGamificacao() {
  return (
    <AdminLayout>
      <Head title="Analytics - Gamificação" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard de Gamificação</h1>
            <p className="text-muted-foreground">
              Pontos, conquistas e rankings dos alunos
            </p>
          </div>
        </div>

        <DashboardFilters />

        <GamificationOverviewCards />

        <TopStudentsTable />
      </div>
    </AdminLayout>
  )
}
