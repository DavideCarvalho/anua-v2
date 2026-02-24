import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.subscriptions.index')
export type SubscriptionsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>
type SubscriptionsGetArgs = Parameters<ReturnType<typeof resolveRoute>['$get']>[0]

interface UseSubscriptionsOptions {
  status?: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'BLOCKED' | 'CANCELED' | 'PAUSED'
  schoolId?: string
  schoolChainId?: string
  page?: number
  limit?: number
}

export function useSubscriptionsQueryOptions(options: UseSubscriptionsOptions = {}) {
  const { status, schoolId, schoolChainId, page = 1, limit = 20 } = options
  const requestArgs: SubscriptionsGetArgs = {
    query: { status, schoolId, schoolChainId, page, limit },
  }

  return queryOptions({
    queryKey: ['subscriptions', { status, schoolId, schoolChainId, page, limit }],
    queryFn: () => {
      return tuyau.$route('api.v1.subscriptions.index').$get(requestArgs).unwrap()
    },
  })
}
