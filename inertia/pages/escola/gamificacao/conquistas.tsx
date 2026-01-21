import { Head } from '@inertiajs/react'
import { Suspense } from 'react'
import { Trophy } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { AchievementsTable } from '../../../containers/gamificacao/achievements-table'

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ConquistasPage() {
  return (
    <EscolaLayout>
      <Head title="Conquistas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Conquistas
          </h1>
          <p className="text-muted-foreground">
            Gerencie badges e conquistas disponíveis para os alunos
          </p>
        </div>

        <Suspense fallback={<TableSkeleton />}>
          <AchievementsTable />
        </Suspense>
      </div>
    </EscolaLayout>
  )
}
