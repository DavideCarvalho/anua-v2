import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.schoolUsageMetrics.show')
export type SchoolUsageMetricsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

interface UseSchoolUsageMetricsOptions {
  schoolId: string
  month?: number
  year?: number
}

export function useSchoolUsageMetricsQueryOptions(options: UseSchoolUsageMetricsOptions) {
  const { schoolId, month, year } = options

  return {
    queryKey: ['school-usage-metrics', { schoolId, month, year }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.schoolUsageMetrics.show')
        .$get({ query: { schoolId, month, year } })
        .unwrap()
    },
    enabled: !!schoolId,
  }
}

export function useSchoolUsageMetrics(options: UseSchoolUsageMetricsOptions) {
  return useSuspenseQuery(useSchoolUsageMetricsQueryOptions(options))
}
