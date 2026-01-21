import { useQuery } from '@tanstack/react-query'
import { DollarSign, ShoppingCart, Package, TrendingUp, CreditCard, ArrowDownCircle } from 'lucide-react'
import { useSearchParams } from '../../../hooks/use-search-params'
import { useCanteenOverviewQueryOptions } from '../../../hooks/queries/use-canteen-overview'
import { StatCard } from '../shared/stat-card'
import { OverviewCardsSkeleton } from '../shared/overview-cards-skeleton'

export function CanteenOverviewCards() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    useCanteenOverviewQueryOptions({
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
        Erro ao carregar dados da cantina
      </div>
    )
  }

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        title="Receita Total"
        value={formatCurrency(data.totalRevenue)}
        icon={DollarSign}
      />
      <StatCard
        title="Vendas Hoje"
        value={data.todaySales.toLocaleString('pt-BR')}
        description={formatCurrency(data.todayRevenue)}
        icon={ShoppingCart}
      />
      <StatCard
        title="Ticket Médio"
        value={formatCurrency(data.averageTicket)}
        icon={TrendingUp}
      />
      <StatCard
        title="Itens Disponíveis"
        value={`${data.availableItems}/${data.totalItems}`}
        icon={Package}
      />
      <StatCard
        title="Total de Créditos"
        value={formatCurrency(data.totalCredits)}
        icon={CreditCard}
      />
      <StatCard
        title="Total de Débitos"
        value={formatCurrency(data.totalDebits)}
        icon={ArrowDownCircle}
      />
    </div>
  )
}
