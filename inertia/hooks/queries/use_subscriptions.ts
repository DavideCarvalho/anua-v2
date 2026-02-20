import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.subscriptions.index')
export type SubscriptionsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

interface UseSubscriptionsOptions {
  status?: string
  schoolId?: string
  schoolChainId?: string
  page?: number
  limit?: number
}

export function useSubscriptionsQueryOptions(options: UseSubscriptionsOptions = {}) {
  const { status, schoolId, schoolChainId, page = 1, limit = 20 } = options

  return {
    queryKey: ['subscriptions', { status, schoolId, schoolChainId, page, limit }],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.subscriptions.index')
        .$get({ query: { status, schoolId, schoolChainId, page, limit } as any })
        .unwrap()
    },
  } satisfies QueryOptions<SubscriptionsResponse>
}
