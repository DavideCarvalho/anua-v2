import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.subscriptionPlans.index')

export type SubscriptionPlansResponse = InferResponseType<typeof $route.$get>

interface UseSubscriptionPlansOptions {
  page?: number
  limit?: number
  isActive?: boolean
}

export function useSubscriptionPlansQueryOptions(options: UseSubscriptionPlansOptions = {}) {
  const { page = 1, limit = 50, isActive } = options

  return {
    queryKey: ['subscription-plans', { page, limit, isActive }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.subscriptionPlans.index')
        .$get({ query: { page, limit, isActive } })
        .unwrap()
    },
  } satisfies QueryOptions<SubscriptionPlansResponse>
}
