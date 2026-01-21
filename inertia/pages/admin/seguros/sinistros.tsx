import { Head } from '@inertiajs/react'
import { Suspense } from 'react'
import { AlertCircle } from 'lucide-react'

import { AdminLayout } from '../../../components/layouts'
import {
  InsuranceClaimsTable,
  InsuranceClaimsTableSkeleton,
} from '../../../containers/insurance/insurance-claims-table'

export default function AdminSinistrosPage() {
  return (
    <AdminLayout>
      <Head title="Sinistros - Seguros - Admin" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            Sinistros
          </h1>
          <p className="text-muted-foreground">
            Gerencie sinistros de inadimplência das escolas
          </p>
        </div>

        <Suspense fallback={<InsuranceClaimsTableSkeleton />}>
          <InsuranceClaimsTable />
        </Suspense>
      </div>
    </AdminLayout>
  )
}
