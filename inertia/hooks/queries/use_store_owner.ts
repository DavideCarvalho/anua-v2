import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

// Own store
const $storeRoute = tuyau.api.v1['store-owner'].store.$get

export type OwnStoreResponse = InferResponseType<typeof $storeRoute>

export function useOwnStoreQueryOptions() {
  return {
    queryKey: ['storeOwner', 'store'],
    queryFn: () => $storeRoute().unwrap(),
  } satisfies QueryOptions
}

// Own products
const $productsRoute = tuyau.api.v1['store-owner'].products.$get

export type OwnProductsResponse = InferResponseType<typeof $productsRoute>

type ProductsQuery = NonNullable<Parameters<typeof $productsRoute>[0]>['query']

export function useOwnProductsQueryOptions(query: ProductsQuery = {}) {
  const mergedQuery: ProductsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }
  return {
    queryKey: ['storeOwner', 'products', mergedQuery],
    queryFn: () => $productsRoute({ query: mergedQuery }).unwrap(),
  } satisfies QueryOptions
}

// Own orders
const $ordersRoute = tuyau.api.v1['store-owner'].orders.$get

export type OwnOrdersResponse = InferResponseType<typeof $ordersRoute>

type OrdersQuery = NonNullable<Parameters<typeof $ordersRoute>[0]>['query']

export function useOwnOrdersQueryOptions(query: OrdersQuery = {}) {
  const mergedQuery: OrdersQuery = {
    page: 1,
    limit: 10,
    ...query,
  }
  return {
    queryKey: ['storeOwner', 'orders', mergedQuery],
    queryFn: () => $ordersRoute({ query: mergedQuery }).unwrap(),
  } satisfies QueryOptions
}

// Financial settings
const $financialRoute = tuyau.api.v1['store-owner']['financial-settings'].$get

export type OwnFinancialResponse = InferResponseType<typeof $financialRoute>

export function useOwnFinancialQueryOptions() {
  return {
    queryKey: ['storeOwner', 'financial'],
    queryFn: () => $financialRoute().unwrap(),
  } satisfies QueryOptions
}

// Settlements
const $settlementsRoute = tuyau.api.v1['store-owner'].settlements.$get

export type OwnSettlementsResponse = InferResponseType<typeof $settlementsRoute>

type SettlementsQuery = NonNullable<Parameters<typeof $settlementsRoute>[0]>['query']

export function useOwnSettlementsQueryOptions(query: SettlementsQuery = {}) {
  const mergedQuery: SettlementsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }
  return {
    queryKey: ['storeOwner', 'settlements', mergedQuery],
    queryFn: () => $settlementsRoute({ query: mergedQuery }).unwrap(),
  } satisfies QueryOptions
}
