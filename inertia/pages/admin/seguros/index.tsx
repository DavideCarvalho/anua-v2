import { Head, Link } from '@inertiajs/react'
import { Suspense } from 'react'
import { Shield, AlertCircle, FileText, BarChart3, Settings } from 'lucide-react'

import { AdminLayout } from '../../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import {
  InsuranceStatsCards,
  InsuranceStatsCardsSkeleton,
} from '../../../containers/insurance/insurance-stats-cards'
import {
  InsuranceClaimsTable,
  InsuranceClaimsTableSkeleton,
} from '../../../containers/insurance/insurance-claims-table'

export default function AdminSegurosPage() {
  return (
    <AdminLayout>
      <Head title="Seguros - Admin" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Seguros
            </h1>
            <p className="text-muted-foreground">
              Gerencie o seguro educacional da plataforma
            </p>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid gap-4 md:grid-cols-4">
          <Link href="/admin/seguros/sinistros">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-sm">Sinistros</CardTitle>
                <CardDescription className="text-xs">
                  Gerenciar sinistros pendentes
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/seguros/faturamento">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-sm">Faturamento</CardTitle>
                <CardDescription className="text-xs">
                  Boletos e pagamentos
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/seguros/analytics">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-sm">Analytics</CardTitle>
                <CardDescription className="text-xs">
                  Relatórios e métricas
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/seguros/configuracao">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <Settings className="h-5 w-5 text-gray-600" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-sm">Configuração</CardTitle>
                <CardDescription className="text-xs">
                  Configurar escolas e redes
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Cards */}
        <Suspense fallback={<InsuranceStatsCardsSkeleton />}>
          <InsuranceStatsCards />
        </Suspense>

        {/* Recent Claims */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Sinistros Recentes</h2>
          <Suspense fallback={<InsuranceClaimsTableSkeleton />}>
            <InsuranceClaimsTable />
          </Suspense>
        </div>
      </div>
    </AdminLayout>
  )
}
