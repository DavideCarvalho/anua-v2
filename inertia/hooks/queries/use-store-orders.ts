import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.storeOrders.index')

export type StoreOrdersResponse = InferResponseType<typeof $route.$get>

interface UseStoreOrdersOptions {
  schoolId?: string
  studentId?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export function useStoreOrdersQueryOptions(options: UseStoreOrdersOptions = {}) {
  const { schoolId, studentId, status, search, page = 1, limit = 20 } = options

  return {
    queryKey: ['store-orders', { schoolId, studentId, status, search, page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.storeOrders.index')
        .$get({ query: { schoolId, studentId, status, search, page, limit } })
        .unwrap()
    },
  } satisfies QueryOptions<StoreOrdersResponse>
}
