import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

// --- Stores list ---
const storesListRoute = tuyau.api.v1.stores.$get
export type StoresListResponse = InferResponseType<typeof storesListRoute>

export function useStoresQueryOptions(
  query?: NonNullable<Parameters<typeof storesListRoute>[0]>['query']
) {
  const mergedQuery = { page: 1, limit: 20, ...query }
  return {
    queryKey: ['stores', mergedQuery],
    queryFn: () => storesListRoute({ query: mergedQuery }).unwrap(),
  } satisfies QueryOptions
}

// --- Store detail ---
const storeShowRoute = tuyau.$route('api.v1.stores.show')
export type StoreDetailResponse = InferResponseType<typeof storeShowRoute.$get>

export function useStoreQueryOptions(id: string) {
  return {
    queryKey: ['store', id],
    queryFn: () => tuyau.$route('api.v1.stores.show', { id }).$get().unwrap(),
    enabled: !!id,
  } satisfies QueryOptions
}

// --- Store items ---
const storeItemsListRoute = tuyau.api.v1['store-items'].$get
export type StoreItemsResponse = InferResponseType<typeof storeItemsListRoute>
type StoreItemsQuery = NonNullable<Parameters<typeof storeItemsListRoute>[0]>['query']

export function useStoreItemsQueryOptions(query: StoreItemsQuery) {
  return {
    queryKey: ['storeItems', query],
    queryFn: () => storeItemsListRoute({ query }).unwrap(),
  } satisfies QueryOptions
}

// --- Store item detail (for type export) ---
const storeItemShowRoute = tuyau.$route('api.v1.storeItems.show')
export type StoreItemResponse = InferResponseType<typeof storeItemShowRoute.$get>

// --- Store orders ---
const storeOrdersRoute = tuyau.api.v1['store-orders'].$get
export type StoreOrdersResponse = InferResponseType<typeof storeOrdersRoute>
type StoreOrdersQuery = NonNullable<Parameters<typeof storeOrdersRoute>[0]>['query']

export function useStoreOrdersQueryOptions(query: StoreOrdersQuery) {
  return {
    queryKey: ['storeOrders', query],
    queryFn: () => storeOrdersRoute({ query }).unwrap(),
  } satisfies QueryOptions
}

// --- Store settlements ---
const storeSettlementsRoute = tuyau.api.v1['store-settlements'].$get
export type StoreSettlementsResponse = InferResponseType<typeof storeSettlementsRoute>
type StoreSettlementsQuery = NonNullable<Parameters<typeof storeSettlementsRoute>[0]>['query']

export function useStoreSettlementsQueryOptions(query: StoreSettlementsQuery) {
  return {
    queryKey: ['storeSettlements', query],
    queryFn: () => storeSettlementsRoute({ query }).unwrap(),
  } satisfies QueryOptions
}

// --- Financial settings ---
const financialSettingsShowRoute = tuyau.$route('api.v1.stores.financialSettings.show')
export type StoreFinancialSettingsResponse = InferResponseType<
  typeof financialSettingsShowRoute.$get
>

export function useStoreFinancialSettingsQueryOptions(storeId: string) {
  return {
    queryKey: ['storeFinancialSettings', storeId],
    queryFn: () =>
      tuyau.$route('api.v1.stores.financialSettings.show', { storeId }).$get().unwrap(),
    enabled: !!storeId,
  } satisfies QueryOptions
}

// --- Installment rules ---
const installmentRulesRoute = tuyau.api.v1['store-installment-rules'].$get
export type StoreInstallmentRulesResponse = InferResponseType<typeof installmentRulesRoute>
type InstallmentRulesQuery = NonNullable<Parameters<typeof installmentRulesRoute>[0]>['query']

export function useStoreInstallmentRulesQueryOptions(query: InstallmentRulesQuery) {
  return {
    queryKey: ['storeInstallmentRules', query],
    queryFn: () => installmentRulesRoute({ query }).unwrap(),
  } satisfies QueryOptions
}
