import { Head } from '@inertiajs/react'
import { AdminLayout } from '../../../components/layouts'
import { DashboardFilters } from '../../../containers/admin-analytics/shared'
import {
  CanteenOverviewCards,
  CanteenTrendsChart,
  TopSellingItemsTable,
} from '../../../containers/admin-analytics/canteen'

export default function AdminAnalyticsCantina() {
  return (
    <AdminLayout>
      <Head title="Analytics - Cantina" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard da Cantina</h1>
            <p className="text-muted-foreground">
              Vendas, receita e métricas de consumo
            </p>
          </div>
        </div>

        <DashboardFilters />

        <CanteenOverviewCards />

        <div className="grid gap-6 lg:grid-cols-2">
          <CanteenTrendsChart />
          <TopSellingItemsTable />
        </div>
      </div>
    </AdminLayout>
  )
}
