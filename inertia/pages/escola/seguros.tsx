import { Head } from '@inertiajs/react'
import { Suspense } from 'react'
import { Shield } from 'lucide-react'

import { EscolaLayout } from '../../components/layouts'
import { useAuthUser } from '../../stores/auth_store'
import {
  SchoolInsuranceOverview,
  SchoolInsuranceOverviewSkeleton,
} from '../../containers/insurance/school-insurance-overview'

export default function SegurosPage() {
  const user = useAuthUser()
  const schoolId = user?.school?.id

  if (!schoolId) {
    return (
      <EscolaLayout>
        <Head title="Seguros" />
        <div className="py-12 text-center text-muted-foreground">Escola não encontrada.</div>
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
