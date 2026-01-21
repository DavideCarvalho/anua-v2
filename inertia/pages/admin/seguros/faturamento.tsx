import { Head } from '@inertiajs/react'
import { Suspense } from 'react'
import { FileText } from 'lucide-react'

import { AdminLayout } from '../../../components/layouts'
import {
  InsuranceBillingsTable,
  InsuranceBillingsTableSkeleton,
} from '../../../containers/insurance/insurance-billings-table'

export default function AdminFaturamentoPage() {
  return (
    <AdminLayout>
      <Head title="Faturamento - Seguros - Admin" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Faturamento
          </h1>
          <p className="text-muted-foreground">
            Acompanhe os faturamentos mensais de seguro das escolas
          </p>
        </div>

        <Suspense fallback={<InsuranceBillingsTableSkeleton />}>
          <InsuranceBillingsTable />
        </Suspense>
      </div>
    </AdminLayout>
  )
}
