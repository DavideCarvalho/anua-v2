import { Head, usePage } from '@inertiajs/react'
import { ResponsavelLayout } from '../../components/layouts'
import { ResponsavelStatsContainer } from '../../containers/responsavel-stats-container'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { BookOpen, Calendar, DollarSign, Trophy } from 'lucide-react'
import type { SharedProps } from '../../lib/types'

export default function ResponsavelDashboard() {
  const { props } = usePage<SharedProps>()
  const user = props.user

  return (
    <ResponsavelLayout>
      <Head title="Início" />

      <div className="space-y-6">
        {/* Welcome section */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Olá, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">Acompanhe o desempenho dos seus filhos</p>
        </div>

        {/* Stats container with Suspense */}
        <ResponsavelStatsContainer />

        {/* Quick links */}
        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/responsavel/notas"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors"
            >
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-medium">Notas</span>
            </a>
            <a
              href="/responsavel/frequencia"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors"
            >
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium">Frequência</span>
            </a>
            <a
              href="/responsavel/mensalidades"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors"
            >
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="font-medium">Mensalidades</span>
            </a>
            <a
              href="/responsavel/gamificacao"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors"
            >
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-medium">Gamificação</span>
            </a>
          </CardContent>
        </Card>
      </div>
    </ResponsavelLayout>
  )
}
