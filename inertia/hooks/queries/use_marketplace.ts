import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

// Marketplace stores
const resolveStoresRoute = () => tuyau.api.v1.marketplace.stores.$get

export type MarketplaceStoresResponse = InferResponseType<ReturnType<typeof resolveStoresRoute>>

export function useMarketplaceStoresQueryOptions(studentId?: string) {
  return queryOptions({
    queryKey: ['marketplace', 'stores', { studentId }],
    queryFn: () => {
      const route = resolveStoresRoute()
      return route({ query: { studentId } }).unwrap()
    },
  })
}

// Store items
const resolveMarketplaceItemsRoute = () => tuyau.$route('api.v1.marketplace.stores.items')

export type MarketplaceItemsResponse = InferResponseType<
  ReturnType<typeof resolveMarketplaceItemsRoute>['$get']
>

export function useMarketplaceItemsQueryOptions(
  storeId: string,
  query?: { page?: number; limit?: number; category?: string }
) {
  const mergedQuery = {
    page: 1,
    limit: 20,
    ...query,
  }
  return queryOptions({
    queryKey: ['marketplace', 'items', storeId, mergedQuery],
    queryFn: () =>
      tuyau
        .$route('api.v1.marketplace.stores.items', { storeId })
        .$get({ query: mergedQuery })
        .unwrap(),
  })
}

// Installment options
const resolveInstallmentOptionsRoute = () => tuyau.api.v1.marketplace['installment-options'].$get

export type InstallmentOptionsResponse = InferResponseType<
  ReturnType<typeof resolveInstallmentOptionsRoute>
>

export function useInstallmentOptionsQueryOptions(storeId: string, amount: number) {
  return queryOptions({
    queryKey: ['marketplace', 'installmentOptions', storeId, amount],
    queryFn: () => {
      const route = resolveInstallmentOptionsRoute()
      return route({ query: { storeId, amount } }).unwrap()
    },
    enabled: !!storeId && amount > 0,
  })
}

// My orders
const resolveMyOrdersRoute = () => tuyau.api.v1.marketplace.orders.$get
export type MyOrdersResponse = InferResponseType<ReturnType<typeof resolveMyOrdersRoute>>

export function useMyOrdersQueryOptions(query?: {
  studentId?: string
  status?: string
  page?: number
  limit?: number
}) {
  const mergedQuery = {
    page: 1,
    limit: 10,
    ...query,
  }
  return queryOptions({
    queryKey: ['marketplace', 'orders', mergedQuery],
    queryFn: () => resolveMyOrdersRoute()({ query: mergedQuery }).unwrap(),
  })
}
