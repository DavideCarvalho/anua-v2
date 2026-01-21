import { Head, usePage } from '@inertiajs/react'
import { Suspense } from 'react'
import { Shield } from 'lucide-react'

import { EscolaLayout } from '../../components/layouts'
import type { SharedProps } from '../../lib/types'
import {
  SchoolInsuranceOverview,
  SchoolInsuranceOverviewSkeleton,
} from '../../containers/insurance/school-insurance-overview'

export default function SegurosPage() {
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.school?.id

  if (!schoolId) {
    return (
      <EscolaLayout>
        <Head title="Seguros" />
        <div className="py-12 text-center text-muted-foreground">
          Escola não encontrada.
        </div>
      </EscolaLayout>
    )
  }

  return (
    <EscolaLayout>
      <Head title="Seguros" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Seguro Educacional
          </h1>
          <p className="text-muted-foreground">
            Acompanhe o seguro da sua escola contra inadimplência
          </p>
        </div>

        <Suspense fallback={<SchoolInsuranceOverviewSkeleton />}>
          <SchoolInsuranceOverview schoolId={schoolId} />
        </Suspense>
      </div>
    </EscolaLayout>
  )
}
