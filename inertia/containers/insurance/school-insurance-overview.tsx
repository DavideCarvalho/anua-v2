import { useSuspenseQuery } from '@tanstack/react-query'
import { Shield, Users, AlertCircle, TrendingDown, DollarSign } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { Skeleton } from '../../components/ui/skeleton'

import { useSchoolInsuranceStatsQueryOptions } from '../../hooks/queries/use_school_insurance_stats'
import { useSchoolInsuranceBillingsQueryOptions } from '../../hooks/queries/use_school_insurance_billings'
import { useSchoolInsuranceClaimsQueryOptions } from '../../hooks/queries/use_school_insurance_claims'
import { brazilianRealFormatter } from '../../lib/formatters'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  APPROVED: 'border-blue-200 bg-blue-50 text-blue-700',
  PAID: 'border-green-200 bg-green-50 text-green-700',
  REJECTED: 'border-red-200 bg-red-50 text-red-700',
  OVERDUE: 'border-red-200 bg-red-50 text-red-700',
  CANCELLED: 'border-gray-200 bg-gray-50 text-gray-700',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  PAID: 'Pago',
  REJECTED: 'Rejeitado',
  OVERDUE: 'Vencido',
  CANCELLED: 'Cancelado',
}

interface SchoolInsuranceOverviewProps {
  schoolId: string
}

export function SchoolInsuranceOverview({ schoolId }: SchoolInsuranceOverviewProps) {
  const { data: stats } = useSuspenseQuery(useSchoolInsuranceStatsQueryOptions(schoolId))
  const { data: billingsData } = useSuspenseQuery(
    useSchoolInsuranceBillingsQueryOptions(schoolId, 3)
  )
  const { data: claimsData } = useSuspenseQuery(
    useSchoolInsuranceClaimsQueryOptions(schoolId, undefined, 5)
  )

  const billings = billingsData?.data || []
  const claims = claimsData?.data || []

  const formatPeriod = (period: string) => {
    const date = new Date(period)
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Segurados</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.insuredStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.insuredPercentage || 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.latestBilling
                ? brazilianRealFormatter(stats.latestBilling.totalAmount / 100)
                : '-'}
            </div>
            {stats?.latestBilling && (
              <Badge
                variant="outline"
                className={`text-xs ${STATUS_COLORS[stats.latestBilling.status] || ''}`}
              >
                {STATUS_LABELS[stats.latestBilling.status] || stats.latestBilling.status}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sinistros Ativos</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeClaims || 0}</div>
            <p className="text-xs text-muted-foreground">pendentes ou aprovados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Inadimplência</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (stats?.defaultRate || 0) > 20
                  ? 'text-red-600'
                  : (stats?.defaultRate || 0) > 10
                    ? 'text-yellow-600'
                    : 'text-green-600'
              }`}
            >
              {stats?.defaultRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">da escola</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Billings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Faturamentos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {billings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum faturamento encontrado.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Alunos</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billings.map((billing: any) => (
                    <TableRow key={billing.id}>
                      <TableCell className="capitalize">{formatPeriod(billing.period)}</TableCell>
                      <TableCell>{billing.insuredStudentsCount}</TableCell>
                      <TableCell>{brazilianRealFormatter(billing.totalAmount / 100)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${STATUS_COLORS[billing.status] || ''}`}
                        >
                          {STATUS_LABELS[billing.status] || billing.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Active Claims */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Sinistros Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {claims.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum sinistro ativo.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Valor Coberto</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim: any) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">{claim.student.name}</TableCell>
                      <TableCell className="text-green-600">
                        {brazilianRealFormatter(claim.coveredAmount / 100)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${STATUS_COLORS[claim.status] || ''}`}
                        >
                          {STATUS_LABELS[claim.status] || claim.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Sobre o Seguro Educacional</h4>
              <p className="text-sm text-blue-800 mt-1">
                O seguro educacional protege sua escola contra inadimplência. Quando um aluno
                atinge o período de carência com pagamento em atraso, um sinistro é aberto
                automaticamente e você pode receber até{' '}
                <strong>{(stats?.latestBilling as any)?.insurancePercentage || 100}%</strong> do valor
                em atraso após aprovação.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function SchoolInsuranceOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
