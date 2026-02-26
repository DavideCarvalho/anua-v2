import { Head } from '@inertiajs/react'
import { Suspense } from 'react'
import { Trophy } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { LeaderboardsManagement } from '../../../containers/gamificacao/leaderboards-management'
import { useAuthUser } from '../../../stores/auth_store'

function LeaderboardsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function GamificacaoPage() {
  const user = useAuthUser()
  const schoolId = user?.schoolId

  return (
    <EscolaLayout>
      <Head title="Gamificação" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Gamificação
          </h1>
          <p className="text-muted-foreground">Gerencie rankings, pontos e conquistas</p>
        </div>

        {schoolId ? (
          <Suspense fallback={<LeaderboardsSkeleton />}>
            <LeaderboardsManagement schoolId={schoolId} />
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
