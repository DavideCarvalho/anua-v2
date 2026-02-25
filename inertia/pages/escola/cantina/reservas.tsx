import { Head, usePage } from '@inertiajs/react'
import { Suspense } from 'react'
import { Calendar } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { CanteenContextBar } from '../../../components/cantina/canteen-context-bar'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { MealReservationsTable } from '../../../containers/cantina/meal-reservations-table'
import type { SharedProps } from '../../../lib/types'

interface PageProps extends SharedProps {
  canteenId?: string | null
}

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
  const { props } = usePage<PageProps>()
  const canteenId = props.canteenId

  return (
    <EscolaLayout>
      <Head title="Reservas de Refeições" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Reservas de Refeições
          </h1>
          <p className="text-muted-foreground">Gerencie as reservas de refeições dos alunos</p>
        </div>

        <CanteenContextBar />

        {canteenId ? (
          <Suspense fallback={<TableSkeleton />}>
            <MealReservationsTable canteenId={canteenId} />
          </Suspense>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Cantina não encontrada no contexto.
            </CardContent>
          </Card>
        )}
      </div>
    </EscolaLayout>
  )
}
