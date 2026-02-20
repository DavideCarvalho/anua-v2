import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.canteenReports.summary')
export type CanteenReportResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

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
  }
}

export function useCanteenReport(options: UseCanteenReportOptions) {
  return useSuspenseQuery(useCanteenReportQueryOptions(options))
}
