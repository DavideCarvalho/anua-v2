import { Head, usePage } from '@inertiajs/react'
import { AdminLayout } from '../../components/layouts'
import { AdminStatsContainer } from '../../containers/admin-stats-container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Building2, DollarSign } from 'lucide-react'
import type { SharedProps } from '../../lib/types'

export default function AdminDashboard() {
  const { props } = usePage<SharedProps>()
  const user = props.user

  return (
    <AdminLayout>
      <Head title="Dashboard Admin" />

      <div className="space-y-6">
        {/* Welcome section */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel Administrativo</h1>
          <p className="text-muted-foreground">Visão geral da plataforma Anua</p>
        </div>

        {/* Stats container with Suspense */}
        <AdminStatsContainer />

        {/* Quick actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento</CardTitle>
              <CardDescription>Acesse as principais funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <a
                href="/admin/escolas"
                className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors"
              >
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Escolas</p>
                  <p className="text-sm text-muted-foreground">Gerenciar escolas cadastradas</p>
                </div>
              </a>
              <a
                href="/admin/billing/dashboard"
                className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors"
              >
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Billing</p>
                  <p className="text-sm text-muted-foreground">Faturas e assinaturas</p>
                </div>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Escolas Recentes</CardTitle>
              <CardDescription>Últimas escolas cadastradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground text-center py-8">
                Carregando...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
