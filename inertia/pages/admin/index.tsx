import { Head } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { AdminLayout } from '../../components/layouts'
import { AdminStatsContainer } from '../../containers/admin-stats-container'
import { useSchoolsQueryOptions } from '../../hooks/queries/use-schools'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Building2, DollarSign, Loader2 } from 'lucide-react'

export default function AdminDashboard() {
  const { data: schoolsData, isLoading: isLoadingSchools } = useQuery(
    useSchoolsQueryOptions({ page: 1, limit: 5 })
  )
  const recentSchools = schoolsData?.data ?? []

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
              {isLoadingSchools ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentSchools.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma escola cadastrada
                </div>
              ) : (
                <div className="space-y-2">
                  {recentSchools.map((school: any) => (
                    <a
                      key={school.id}
                      href={`/admin/escolas/${school.id}`}
                      className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{school.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {school.city || 'Cidade não informada'}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
