import { Head, usePage } from '@inertiajs/react'
import { Suspense } from 'react'
import { Wallet } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { MonthlyTransfersTable } from '../../../containers/cantina/monthly-transfers-table'
import type { SharedProps } from '../../../lib/types'

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CantinaTransferenciasPage() {
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.schoolId

  return (
    <EscolaLayout>
      <Head title="Transferências Mensais" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Transferências Mensais
          </h1>
          <p className="text-muted-foreground">
            Gerencie as transferências mensais da cantina
          </p>
        </div>

        {schoolId ? (
          <Suspense fallback={<TableSkeleton />}>
            <MonthlyTransfersTable />
          </Suspense>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Escola não encontrada no contexto do usuário.
            </CardContent>
          </Card>
        )}
      </div>
    </EscolaLayout>
  )
}
