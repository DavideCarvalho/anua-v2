import { Head } from '@inertiajs/react'
import { Suspense } from 'react'
import { Target } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent } from '../../../components/ui/card'
import { ChallengesTable } from '../../../containers/gamificacao/challenges-table'

function TableSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DesafiosPage() {
  return (
    <EscolaLayout>
      <Head title="Desafios" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6" />
            Desafios
          </h1>
          <p className="text-muted-foreground">
            Gerencie desafios e missões disponíveis para os alunos
          </p>
        </div>

        <Suspense fallback={<TableSkeleton />}>
          <ChallengesTable />
        </Suspense>
      </div>
    </EscolaLayout>
  )
}
