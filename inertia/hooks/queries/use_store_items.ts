import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.storeItems.index')

export type StoreItemsResponse = InferResponseType<typeof $route.$get>

interface UseStoreItemsOptions {
  schoolId?: string
  category?: string
  paymentMode?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export function useStoreItemsQueryOptions(options: UseStoreItemsOptions = {}) {
  const { schoolId, category, paymentMode, isActive, page = 1, limit = 20 } = options

  return {
    queryKey: ['store-items', { schoolId, category, paymentMode, isActive, page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.storeItems.index')
        .$get({ query: { schoolId, category, paymentMode, isActive, page, limit } as any })
        .unwrap()
    },
  } satisfies QueryOptions<StoreItemsResponse>
}
