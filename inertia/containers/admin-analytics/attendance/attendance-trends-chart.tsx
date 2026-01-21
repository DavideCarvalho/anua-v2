import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from '../../../hooks/use-search-params'
import { useAttendanceTrendsQueryOptions } from '../../../hooks/queries/use-attendance-trends'
import { ChartContainer } from '../shared/chart-container'

export function AttendanceTrendsChart() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    useAttendanceTrendsQueryOptions({
      schoolId: params.schoolId,
      schoolChainId: params.schoolChainId,
    })
  )

  return (
    <ChartContainer
      title="Tendência de Presença"
      description="Taxa de presença ao longo do tempo"
      isLoading={isLoading}
      error={error}
    >
      {data && data.trends && data.trends.length > 0 ? (
        <div className="space-y-2">
          {data.trends.slice(-10).map((item: any) => (
            <div key={item.period} className="flex items-center gap-4">
              <span className="w-24 text-sm text-muted-foreground">{item.period}</span>
              <div className="flex-1">
                <div className="flex h-6 overflow-hidden rounded-md bg-muted">
                  <div
                    className="bg-green-500"
                    style={{ width: `${(item.present / item.total) * 100}%` }}
                    title={`Presentes: ${item.present}`}
                  />
                  <div
                    className="bg-yellow-500"
                    style={{ width: `${(item.late / item.total) * 100}%` }}
                    title={`Atrasados: ${item.late}`}
                  />
                  <div
                    className="bg-red-500"
                    style={{ width: `${(item.absent / item.total) * 100}%` }}
                    title={`Ausentes: ${item.absent}`}
                  />
                </div>
              </div>
              <span className="w-16 text-right text-sm font-medium">{item.attendanceRate}%</span>
            </div>
          ))}
          <div className="flex gap-4 pt-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-green-500" />
              <span>Presentes</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-yellow-500" />
              <span>Atrasados</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-red-500" />
              <span>Ausentes</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Nenhum dado de tendência disponível
        </div>
      )}
    </ChartContainer>
  )
}
