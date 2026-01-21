import { Head, usePage } from '@inertiajs/react'
import { Suspense, useState } from 'react'
import { BarChart3, ClipboardList, GraduationCap } from 'lucide-react'

import { EscolaLayout } from '../../components/layouts'
import type { SharedProps } from '../../lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Card, CardContent } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'

import {
  EnrollmentFunnelStats,
  EnrollmentFunnelStatsSkeleton,
} from '../../containers/enrollment-analytics/enrollment-funnel-stats'
import {
  EnrollmentTrendsChart,
  EnrollmentTrendsChartSkeleton,
} from '../../containers/enrollment-analytics/enrollment-trends-chart'
import {
  EnrollmentByLevelTable,
  EnrollmentByLevelTableSkeleton,
} from '../../containers/enrollment-analytics/enrollment-by-level-table'
import { EnrollmentsTable } from '../../containers/enrollment-management/enrollments-table'

function EnrollmentsTableSkeleton() {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="space-y-4">
          <Skeleton className="h-10 w-[200px]" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MatriculasPage() {
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.school?.id
  const [activeTab, setActiveTab] = useState('management')

  return (
    <EscolaLayout>
      <Head title="Matrículas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Matrículas
          </h1>
          <p className="text-muted-foreground">
            Gerencie matrículas e acompanhe analytics
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="management" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Gestão
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="management" className="mt-6 space-y-6">
            <Suspense fallback={<EnrollmentsTableSkeleton />}>
              <EnrollmentsTable schoolId={schoolId!} />
            </Suspense>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6 space-y-6">
            {/* Funnel Stats */}
            <Suspense fallback={<EnrollmentFunnelStatsSkeleton />}>
              <EnrollmentFunnelStats schoolId={schoolId} />
            </Suspense>

            {/* Trends Chart */}
            <Suspense fallback={<EnrollmentTrendsChartSkeleton />}>
              <EnrollmentTrendsChart schoolId={schoolId} days={30} />
            </Suspense>

            {/* By Level Table */}
            <Suspense fallback={<EnrollmentByLevelTableSkeleton />}>
              <EnrollmentByLevelTable schoolId={schoolId} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </EscolaLayout>
  )
}
