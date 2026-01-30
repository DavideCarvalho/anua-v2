import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.canteenMonthlyTransfers.index')

export type CanteenMonthlyTransfersResponse = InferResponseType<typeof $route.$get>

interface UseCanteenMonthlyTransfersOptions {
  canteenId?: string
  month?: number
  year?: number
  status?: string
  page?: number
  limit?: number
}

export function useCanteenMonthlyTransfersQueryOptions(
  options: UseCanteenMonthlyTransfersOptions = {}
) {
  const { canteenId, month, year, status, page = 1, limit = 20 } = options

  return {
    queryKey: ['canteen-monthly-transfers', { canteenId, month, year, status, page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.canteenMonthlyTransfers.index')
        .$get({ query: { canteenId, month, year, status, page, limit } as any })
        .unwrap()
    },
  } satisfies QueryOptions<CanteenMonthlyTransfersResponse>
}
