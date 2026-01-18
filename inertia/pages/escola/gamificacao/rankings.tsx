import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { LeaderboardsListContainer } from '../../../containers/leaderboards-list-container'

export default function RankingsPage() {
  return (
    <EscolaLayout>
      <Head title="Rankings" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rankings</h1>
          <p className="text-muted-foreground">Rankings de pontos e performance</p>
        </div>

        <LeaderboardsListContainer />
      </div>
    </EscolaLayout>
  )
}
