import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.subscriptionInvoices.index')
export type SubscriptionInvoicesResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

interface UseSubscriptionInvoicesOptions {
  subscriptionId?: string
  status?: string
  page?: number
  limit?: number
}

export function useSubscriptionInvoicesQueryOptions(options: UseSubscriptionInvoicesOptions = {}) {
  const { subscriptionId, status, page = 1, limit = 20 } = options

  return {
    queryKey: ['subscription-invoices', { subscriptionId, status, page, limit }],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.subscriptionInvoices.index')
        .$get({ query: { subscriptionId, status, page, limit } as any })
        .unwrap()
    },
  } satisfies QueryOptions<SubscriptionInvoicesResponse>
}
