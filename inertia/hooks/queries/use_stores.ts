import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

// --- Stores list ---
const resolveStoresListRoute = () => tuyau.api.v1.stores.$get
type StoresListGet = ReturnType<typeof resolveStoresListRoute>
export type StoresListResponse = InferResponseType<StoresListGet>

export function useStoresQueryOptions(query?: NonNullable<Parameters<StoresListGet>[0]>['query']) {
  const mergedQuery = { page: 1, limit: 20, ...query }
  return {
    queryKey: ['stores', mergedQuery],
    queryFn: () => {
      const route = resolveStoresListRoute()
      return route({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions
}

// --- Store detail ---
const resolveStoreShowRoute = () => tuyau.$route('api.v1.stores.show')
type StoreShowGet = ReturnType<typeof resolveStoreShowRoute>['$get']
export type StoreDetailResponse = InferResponseType<StoreShowGet>

export function useStoreQueryOptions(id: string) {
  return {
    queryKey: ['store', id],
    queryFn: () => tuyau.$route('api.v1.stores.show', { id }).$get().unwrap(),
    enabled: !!id,
  } satisfies QueryOptions
}

// --- Store items ---
const resolveStoreItemsListRoute = () => tuyau.api.v1['store-items'].$get
type StoreItemsListGet = ReturnType<typeof resolveStoreItemsListRoute>
export type StoreItemsResponse = InferResponseType<StoreItemsListGet>
type StoreItemsQuery = NonNullable<Parameters<StoreItemsListGet>[0]>['query']

export function useStoreItemsQueryOptions(query: StoreItemsQuery) {
  return {
    queryKey: ['storeItems', query],
    queryFn: () => {
      const route = resolveStoreItemsListRoute()
      return route({ query }).unwrap()
    },
  } satisfies QueryOptions
}

// --- Store item detail (for type export) ---
const resolveStoreItemShowRoute = () => tuyau.$route('api.v1.storeItems.show')
type StoreItemShowGet = ReturnType<typeof resolveStoreItemShowRoute>['$get']
export type StoreItemResponse = InferResponseType<StoreItemShowGet>

// --- Store orders ---
const resolveStoreOrdersRoute = () => tuyau.api.v1['store-orders'].$get
type StoreOrdersGet = ReturnType<typeof resolveStoreOrdersRoute>
export type StoreOrdersResponse = InferResponseType<StoreOrdersGet>
type StoreOrdersQuery = NonNullable<Parameters<StoreOrdersGet>[0]>['query']

export function useStoreOrdersQueryOptions(query: StoreOrdersQuery) {
  return {
    queryKey: ['storeOrders', query],
    queryFn: () => {
      const route = resolveStoreOrdersRoute()
      return route({ query }).unwrap()
    },
  } satisfies QueryOptions
}

// --- Store settlements ---
const resolveStoreSettlementsRoute = () => tuyau.api.v1['store-settlements'].$get
type StoreSettlementsGet = ReturnType<typeof resolveStoreSettlementsRoute>
export type StoreSettlementsResponse = InferResponseType<StoreSettlementsGet>
type StoreSettlementsQuery = NonNullable<Parameters<StoreSettlementsGet>[0]>['query']

export function useStoreSettlementsQueryOptions(query: StoreSettlementsQuery) {
  return {
    queryKey: ['storeSettlements', query],
    queryFn: () => {
      const route = resolveStoreSettlementsRoute()
      return route({ query }).unwrap()
    },
  } satisfies QueryOptions
}

// --- Financial settings ---
const resolveFinancialSettingsShowRoute = () => tuyau.$route('api.v1.stores.financialSettings.show')
type FinancialSettingsShowGet = ReturnType<typeof resolveFinancialSettingsShowRoute>['$get']
export type StoreFinancialSettingsResponse = InferResponseType<FinancialSettingsShowGet>

export function useStoreFinancialSettingsQueryOptions(storeId: string) {
  return {
    queryKey: ['storeFinancialSettings', storeId],
    queryFn: () =>
      tuyau.$route('api.v1.stores.financialSettings.show', { storeId }).$get().unwrap(),
    enabled: !!storeId,
  } satisfies QueryOptions
}

// --- Installment rules ---
const resolveInstallmentRulesRoute = () => tuyau.api.v1['store-installment-rules'].$get
type InstallmentRulesGet = ReturnType<typeof resolveInstallmentRulesRoute>
export type StoreInstallmentRulesResponse = InferResponseType<InstallmentRulesGet>
type InstallmentRulesQuery = NonNullable<Parameters<InstallmentRulesGet>[0]>['query']

export function useStoreInstallmentRulesQueryOptions(query: InstallmentRulesQuery) {
  return {
    queryKey: ['storeInstallmentRules', query],
    queryFn: () => {
      const route = resolveInstallmentRulesRoute()
      return route({ query }).unwrap()
    },
  } satisfies QueryOptions
}
