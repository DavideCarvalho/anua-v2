import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.schoolUsageMetrics.show')

export type SchoolUsageMetricsResponse = InferResponseType<typeof $route.$get>

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
  } satisfies QueryOptions<SchoolUsageMetricsResponse>
}

export function useSchoolUsageMetrics(options: UseSchoolUsageMetricsOptions) {
  return useSuspenseQuery(useSchoolUsageMetricsQueryOptions(options))
}
