import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.subscriptionInvoices.index')
export type SubscriptionInvoicesResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>
type SubscriptionInvoicesGetArgs = Parameters<ReturnType<typeof resolveRoute>['$get']>[0]

interface UseSubscriptionInvoicesOptions {
  subscriptionId?: string
  status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELED' | 'REFUNDED'
  page?: number
  limit?: number
}

export function useSubscriptionInvoicesQueryOptions(options: UseSubscriptionInvoicesOptions = {}) {
  const { subscriptionId, status, page = 1, limit = 20 } = options
  const requestArgs: SubscriptionInvoicesGetArgs = {
    query: { subscriptionId, status, page, limit },
  }

  return queryOptions({
    queryKey: ['subscription-invoices', { subscriptionId, status, page, limit }],
    queryFn: () => {
      return tuyau.$route('api.v1.subscriptionInvoices.index').$get(requestArgs).unwrap()
    },
  })
}
