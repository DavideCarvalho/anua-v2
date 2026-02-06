import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

// Marketplace stores
const $storesRoute = tuyau.api.v1.marketplace.stores.$get

export type MarketplaceStoresResponse = InferResponseType<typeof $storesRoute>

export function useMarketplaceStoresQueryOptions(studentId?: string) {
  return {
    queryKey: ['marketplace', 'stores', { studentId }],
    queryFn: () => $storesRoute({ query: { studentId } }).unwrap(),
  } satisfies QueryOptions
}

// Store items
const marketplaceItemsRoute = tuyau.$route('api.v1.marketplace.stores.items')

export type MarketplaceItemsResponse = InferResponseType<typeof marketplaceItemsRoute.$get>

export function useMarketplaceItemsQueryOptions(
  storeId: string,
  query?: { page?: number; limit?: number; category?: string }
) {
  const mergedQuery = {
    page: 1,
    limit: 20,
    ...query,
  }
  return {
    queryKey: ['marketplace', 'items', storeId, mergedQuery],
    queryFn: () =>
      tuyau
        .$route('api.v1.marketplace.stores.items', { storeId })
        .$get({ query: mergedQuery })
        .unwrap(),
  } satisfies QueryOptions
}

// Installment options
const installmentOptionsRoute = tuyau.api.v1.marketplace['installment-options'].$get

export type InstallmentOptionsResponse = InferResponseType<typeof installmentOptionsRoute>

export function useInstallmentOptionsQueryOptions(storeId: string, amount: number) {
  return {
    queryKey: ['marketplace', 'installmentOptions', storeId, amount],
    queryFn: () => installmentOptionsRoute({ query: { storeId, amount } }).unwrap(),
    enabled: !!storeId && amount > 0,
  } satisfies QueryOptions
}

// My orders
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
  return {
    queryKey: ['marketplace', 'orders', mergedQuery],
    queryFn: () => tuyau.api.v1.marketplace.orders.$get({ query: mergedQuery }).unwrap(),
  } satisfies QueryOptions
}
