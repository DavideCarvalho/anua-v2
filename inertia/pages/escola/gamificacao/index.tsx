import { Head } from '@inertiajs/react'
import { usePage } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { LeaderboardsListContainer } from '../../../containers/leaderboards-list-container'
import type { SharedProps } from '../../../lib/types'

export default function GamificacaoPage() {
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.schoolId

  return (
    <EscolaLayout>
      <Head title="Gamificação" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gamificação</h1>
          <p className="text-muted-foreground">Acompanhe pontos, níveis e rankings</p>
        </div>

        {/* Por enquanto: lista de leaderboards */}
        {schoolId ? (
          <LeaderboardsListContainer />
        ) : (
          <div className="text-sm text-muted-foreground">
            Escola não encontrada no contexto do usuário.
          </div>
        )}
      </div>
    </EscolaLayout>
  )
}
