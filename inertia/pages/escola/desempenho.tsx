import { Head } from '@inertiajs/react'
import { Suspense } from 'react'

import { EscolaLayout } from '../../components/layouts'

import {
  AcademicOverviewCards,
  AcademicOverviewCardsSkeleton,
} from '../../containers/grades/academic-overview-cards'
import {
  GradeDistributionChart,
  GradeDistributionChartSkeleton,
} from '../../containers/grades/grade-distribution-chart'
import {
  AtRiskStudentsTable,
  AtRiskStudentsTableSkeleton,
} from '../../containers/grades/at-risk-students-table'

export default function DesempenhoPage() {
  return (
    <EscolaLayout>
      <Head title="Desempenho Academico" />

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Desempenho Academico</h1>
          <p className="text-sm text-muted-foreground">
            Visao geral do desempenho academico dos alunos
          </p>
        </div>

        <Suspense fallback={<AcademicOverviewCardsSkeleton />}>
          <AcademicOverviewCards />
        </Suspense>

        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<GradeDistributionChartSkeleton />}>
            <GradeDistributionChart />
          </Suspense>

          <Suspense fallback={<AtRiskStudentsTableSkeleton />}>
            <AtRiskStudentsTable />
          </Suspense>
        </div>
      </div>
    </EscolaLayout>
  )
}
