import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from '../../../hooks/use-search-params'
import { useCanteenTrendsQueryOptions } from '../../../hooks/queries/use-canteen-trends'
import { ChartContainer } from '../shared/chart-container'

export function CanteenTrendsChart() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    useCanteenTrendsQueryOptions({
      schoolId: params.schoolId,
      schoolChainId: params.schoolChainId,
    })
  )

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const maxRevenue = data?.trends
    ? Math.max(...data.trends.map((t: any) => t.revenue), 1)
    : 1

  return (
    <ChartContainer
      title="Tendência de Vendas"
      description="Receita ao longo do tempo"
      isLoading={isLoading}
      error={error}
    >
      {data && data.trends && data.trends.length > 0 ? (
        <div className="space-y-2">
          {data.trends.slice(-10).map((item: any) => (
            <div key={item.period} className="flex items-center gap-4">
              <span className="w-24 text-sm text-muted-foreground">{item.period}</span>
              <div className="flex-1">
                <div className="h-6 rounded-md bg-muted">
                  <div
                    className="h-6 rounded-md bg-primary"
                    style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
              <div className="w-32 text-right">
                <span className="text-sm font-medium">{formatCurrency(item.revenue)}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({item.totalSales} vendas)
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Nenhum dado de vendas disponível
        </div>
      )}
    </ChartContainer>
  )
}
