import { useQuery } from '@tanstack/react-query'
import { DollarSign, CheckCircle, Clock, AlertTriangle, Users, Calendar } from 'lucide-react'
import { useSearchParams } from '../../../hooks/use-search-params'
import { usePaymentsOverviewQueryOptions } from '../../../hooks/queries/use-payments-overview'
import { StatCard } from '../shared/stat-card'
import { OverviewCardsSkeleton } from '../shared/overview-cards-skeleton'

export function PaymentsOverviewCards() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    usePaymentsOverviewQueryOptions({
      schoolId: params.schoolId,
      schoolChainId: params.schoolChainId,
    })
  )

  if (isLoading) {
    return <OverviewCardsSkeleton count={6} />
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
        Erro ao carregar dados de pagamentos
      </div>
    )
  }

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        title="Total Recebido"
        value={formatCurrency(data.paidAmount)}
        description={`${data.paidCount} pagamentos`}
        icon={CheckCircle}
      />
      <StatCard
        title="Pendente"
        value={formatCurrency(data.pendingAmount)}
        description={`${data.pendingCount} pagamentos`}
        icon={Clock}
      />
      <StatCard
        title="Em Atraso"
        value={formatCurrency(data.overdueAmount)}
        description={`${data.overdueCount} pagamentos`}
        icon={AlertTriangle}
      />
      <StatCard
        title="Taxa de Pagamento"
        value={`${data.paymentRate}%`}
        icon={DollarSign}
      />
      <StatCard
        title="Alunos Inadimplentes"
        value={data.studentsWithOverdue.toLocaleString('pt-BR')}
        icon={Users}
      />
      <StatCard
        title="Recebido este Mês"
        value={formatCurrency(data.monthReceived)}
        description={`${data.monthPayments} pagamentos`}
        icon={Calendar}
      />
    </div>
  )
}
