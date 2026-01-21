import { Head, usePage } from '@inertiajs/react'
import { Suspense } from 'react'

import { EscolaLayout } from '../../components/layouts'

import { AcademicOverviewCards, AcademicOverviewCardsSkeleton } from '../../containers/grades/academic-overview-cards'
import { GradeDistributionChart, GradeDistributionChartSkeleton } from '../../containers/grades/grade-distribution-chart'
import { AtRiskStudentsTable, AtRiskStudentsTableSkeleton } from '../../containers/grades/at-risk-students-table'

interface PageProps {
  schoolId: string
  [key: string]: any
}

export default function DesempenhoPage() {
  const { schoolId } = usePage<PageProps>().props

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
          <AcademicOverviewCards schoolId={schoolId} />
        </Suspense>

        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<GradeDistributionChartSkeleton />}>
            <GradeDistributionChart schoolId={schoolId} />
          </Suspense>

          <Suspense fallback={<AtRiskStudentsTableSkeleton />}>
            <AtRiskStudentsTable schoolId={schoolId} />
          </Suspense>
        </div>
      </div>
    </EscolaLayout>
  )
}
