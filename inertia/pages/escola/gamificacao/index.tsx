import { Head } from '@inertiajs/react'
import { usePage } from '@inertiajs/react'
import { Suspense } from 'react'
import { Trophy, Medal, Zap } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { LeaderboardsManagement } from '../../../containers/gamificacao/leaderboards-management'
import { GamificationEventsTable } from '../../../containers/gamificacao/gamification-events-table'
import type { SharedProps } from '../../../lib/types'

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

function EventsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
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

export default function GamificacaoPage() {
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.schoolId

  return (
    <EscolaLayout>
      <Head title="Gamificacao" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Gamificacao
          </h1>
          <p className="text-muted-foreground">Gerencie rankings, pontos e conquistas</p>
        </div>

        {schoolId ? (
          <Tabs defaultValue="rankings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="rankings" className="gap-2">
                <Medal className="h-4 w-4" />
                Rankings
              </TabsTrigger>
              <TabsTrigger value="eventos" className="gap-2">
                <Zap className="h-4 w-4" />
                Eventos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rankings">
              <Suspense fallback={<LeaderboardsSkeleton />}>
                <LeaderboardsManagement schoolId={schoolId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="eventos">
              <Suspense fallback={<EventsSkeleton />}>
                <GamificationEventsTable />
              </Suspense>
            </TabsContent>
          </Tabs>
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
