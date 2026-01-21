import { Head, usePage } from '@inertiajs/react'
import { Suspense } from 'react'
import { Calendar } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { MealReservationsTable } from '../../../containers/cantina/meal-reservations-table'
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

export default function CantinaReservasPage() {
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.schoolId

  return (
    <EscolaLayout>
      <Head title="Reservas de Refeições" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Reservas de Refeições
          </h1>
          <p className="text-muted-foreground">
            Gerencie as reservas de refeições dos alunos
          </p>
        </div>

        {schoolId ? (
          <Suspense fallback={<TableSkeleton />}>
            <MealReservationsTable />
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
