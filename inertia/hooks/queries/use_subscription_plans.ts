import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.subscriptionPlans.index')
export type SubscriptionPlansResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>
type SubscriptionPlansGetArgs = Parameters<ReturnType<typeof resolveRoute>['$get']>[0]

interface UseSubscriptionPlansOptions {
  page?: number
  limit?: number
  isActive?: boolean
}

export function useSubscriptionPlansQueryOptions(options: UseSubscriptionPlansOptions = {}) {
  const { page = 1, limit = 50, isActive } = options
  const requestArgs: SubscriptionPlansGetArgs = {
    query: { page, limit, isActive },
  }

  return queryOptions({
    queryKey: ['subscription-plans', { page, limit, isActive }],
    queryFn: () => {
      return tuyau.$route('api.v1.subscriptionPlans.index').$get(requestArgs).unwrap()
    },
  })
}
