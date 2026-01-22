import { useQuery } from '@tanstack/react-query'
import { Shield, AlertCircle, CheckCircle2, DollarSign, Users, FileWarning } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Button } from '../../components/ui/button'
import { useInsuranceStatsQueryOptions } from '../../hooks/queries/use-insurance-stats'
import { brazilianRealFormatter } from '../../lib/formatters'

export function InsuranceStatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function InsuranceStatsCards() {
  const { data, isLoading, isError, error, refetch } = useQuery(useInsuranceStatsQueryOptions())

  if (isLoading) {
    return <InsuranceStatsCardsSkeleton />
  }

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex items-center gap-4 py-6">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div className="flex-1">
            <h3 className="font-semibold text-destructive">Erro ao carregar estatísticas de seguro</h3>
            <p className="text-sm text-muted-foreground">
              {error?.message || 'Ocorreu um erro inesperado'}
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Escolas com Seguro</CardTitle>
          <Shield className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalSchoolsWithInsurance}</div>
          <p className="text-xs text-muted-foreground">escolas protegidas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alunos Segurados</CardTitle>
          <Users className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalInsuredStudents}</div>
          <p className="text-xs text-muted-foreground">alunos com cobertura</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sinistros Pendentes</CardTitle>
          <AlertCircle className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{data.claims.pending}</div>
          <p className="text-xs text-muted-foreground">aguardando revisão</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagos este mês</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{data.claims.paidThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            {brazilianRealFormatter(data.claims.paidAmountThisMonth / 100)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Faturamentos Pendentes</CardTitle>
          <FileWarning className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{data.billings.pending}</div>
          <p className="text-xs text-muted-foreground">boletos a pagar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {brazilianRealFormatter(data.billings.revenueThisMonth / 100)}
          </div>
          <p className="text-xs text-muted-foreground">em seguros pagos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inadimplências Cobertas</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {data.overduePaymentsWithInsurance}
          </div>
          <p className="text-xs text-muted-foreground">pagamentos em atraso</p>
        </CardContent>
      </Card>
    </div>
  )
}
