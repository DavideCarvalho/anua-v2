import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from '../../../hooks/use-search-params'
import { useGradeDistributionQueryOptions } from '../../../hooks/queries/use-grade-distribution'
import { ChartContainer } from '../shared/chart-container'

export function GradeDistributionChart() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    useGradeDistributionQueryOptions({
      schoolId: params.schoolId,
      schoolChainId: params.schoolChainId,
    })
  )

  return (
    <ChartContainer
      title="Distribuição de Notas"
      description="Quantidade de alunos por faixa de nota"
      isLoading={isLoading}
      error={error}
    >
      {data && data.distribution && data.distribution.length > 0 ? (
        <div className="space-y-3">
          {data.distribution.map((item: any) => {
            const percentage = data.total > 0 ? (item.count / data.total) * 100 : 0
            return (
              <div key={item.range} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.range}</span>
                  <span className="text-muted-foreground">
                    {item.count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Nenhum dado de distribuição disponível
        </div>
      )}
    </ChartContainer>
  )
}
