import { Head, usePage } from '@inertiajs/react'
import { EscolaLayout } from '../../components/layouts'
import { EscolaStatsContainer } from '../../containers/escola-stats-container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Users, DollarSign } from 'lucide-react'
import type { SharedProps } from '../../lib/types'

export default function EscolaDashboard() {
  const { props } = usePage<SharedProps>()
  const user = props.user

  return (
    <EscolaLayout>
      <Head title="Dashboard" />

      <div className="space-y-6">
        {/* Welcome section */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Olá, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo ao painel da {user?.school?.name || 'escola'}
          </p>
        </div>

        {/* Stats container with Suspense */}
        <EscolaStatsContainer />

        {/* Quick actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Acesse as funcionalidades mais usadas</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <a
                href="/escola/administrativo/alunos"
                className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors"
              >
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Gerenciar Alunos</p>
                  <p className="text-sm text-muted-foreground">
                    Cadastrar, editar e visualizar alunos
                  </p>
                </div>
              </a>
              <a
                href="/escola/financeiro/mensalidades"
                className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors"
              >
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Mensalidades</p>
                  <p className="text-sm text-muted-foreground">
                    Acompanhar pagamentos e cobranças
                  </p>
                </div>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avisos Recentes</CardTitle>
              <CardDescription>Últimas atualizações do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground text-center py-8">
                Nenhum aviso no momento
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </EscolaLayout>
  )
}
