import { Head } from '@inertiajs/react'
import { Suspense } from 'react'
import { BarChart3 } from 'lucide-react'

import { AdminLayout } from '../../../components/layouts'
import {
  InsuranceStatsCards,
  InsuranceStatsCardsSkeleton,
} from '../../../containers/insurance/insurance-stats-cards'
import {
  DefaultRateBySchool,
  DefaultRateBySchoolSkeleton,
} from '../../../containers/insurance/default-rate-by-school'
import {
  SchoolsWithoutInsurance,
  SchoolsWithoutInsuranceSkeleton,
} from '../../../containers/insurance/schools-without-insurance'

export default function AdminAnalyticsPage() {
  return (
    <AdminLayout>
      <Head title="Analytics - Seguros - Admin" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics de Seguros
          </h1>
          <p className="text-muted-foreground">
            Métricas e análises do seguro educacional
          </p>
        </div>

        <Suspense fallback={<InsuranceStatsCardsSkeleton />}>
          <InsuranceStatsCards />
        </Suspense>

        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<DefaultRateBySchoolSkeleton />}>
            <DefaultRateBySchool />
          </Suspense>

          <Suspense fallback={<SchoolsWithoutInsuranceSkeleton />}>
            <SchoolsWithoutInsurance />
          </Suspense>
        </div>
      </div>
    </AdminLayout>
  )
}
