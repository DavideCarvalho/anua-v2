import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.canteenReports.summary')

export type CanteenReportResponse = InferResponseType<typeof $route.$get>

interface UseCanteenReportOptions {
  canteenId: string
  startDate?: string
  endDate?: string
  topItemsLimit?: number
}

export function useCanteenReportQueryOptions(options: UseCanteenReportOptions) {
  const { canteenId, startDate, endDate, topItemsLimit = 5 } = options

  return {
    queryKey: ['canteen-report', { canteenId, startDate, endDate, topItemsLimit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.canteenReports.summary')
        .$get({ query: { canteenId, startDate, endDate, topItemsLimit } })
        .unwrap()
    },
    enabled: !!canteenId,
  } satisfies QueryOptions<CanteenReportResponse>
}

export function useCanteenReport(options: UseCanteenReportOptions) {
  return useSuspenseQuery(useCanteenReportQueryOptions(options))
}
