import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

// Own store
const resolveStoreRoute = () => tuyau.api.v1['store-owner'].store.$get

export type OwnStoreResponse = InferResponseType<ReturnType<typeof resolveStoreRoute>>

export function useOwnStoreQueryOptions() {
  return {
    queryKey: ['storeOwner', 'store'],
    queryFn: () => resolveStoreRoute()().unwrap(),
  } satisfies QueryOptions
}

// Own products
const resolveProductsRoute = () => tuyau.api.v1['store-owner'].products.$get

export type OwnProductsResponse = InferResponseType<ReturnType<typeof resolveProductsRoute>>

type ProductsQuery = NonNullable<Parameters<ReturnType<typeof resolveProductsRoute>>[0]>['query']

export function useOwnProductsQueryOptions(query: ProductsQuery = {}) {
  const mergedQuery: ProductsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }
  return {
    queryKey: ['storeOwner', 'products', mergedQuery],
    queryFn: () => resolveProductsRoute()({ query: mergedQuery }).unwrap(),
  } satisfies QueryOptions
}

// Own orders
const resolveOrdersRoute = () => tuyau.api.v1['store-owner'].orders.$get

export type OwnOrdersResponse = InferResponseType<ReturnType<typeof resolveOrdersRoute>>

type OrdersQuery = NonNullable<Parameters<ReturnType<typeof resolveOrdersRoute>>[0]>['query']

export function useOwnOrdersQueryOptions(query: OrdersQuery = {}) {
  const mergedQuery: OrdersQuery = {
    page: 1,
    limit: 10,
    ...query,
  }
  return {
    queryKey: ['storeOwner', 'orders', mergedQuery],
    queryFn: () => resolveOrdersRoute()({ query: mergedQuery }).unwrap(),
  } satisfies QueryOptions
}

// Financial settings
const resolveFinancialRoute = () => tuyau.api.v1['store-owner']['financial-settings'].$get

export type OwnFinancialResponse = InferResponseType<ReturnType<typeof resolveFinancialRoute>>

export function useOwnFinancialQueryOptions() {
  return {
    queryKey: ['storeOwner', 'financial'],
    queryFn: () => resolveFinancialRoute()().unwrap(),
  } satisfies QueryOptions
}

// Settlements
const resolveSettlementsRoute = () => tuyau.api.v1['store-owner'].settlements.$get

export type OwnSettlementsResponse = InferResponseType<ReturnType<typeof resolveSettlementsRoute>>

type SettlementsQuery = NonNullable<
  Parameters<ReturnType<typeof resolveSettlementsRoute>>[0]
>['query']

export function useOwnSettlementsQueryOptions(query: SettlementsQuery = {}) {
  const mergedQuery: SettlementsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }
  return {
    queryKey: ['storeOwner', 'settlements', mergedQuery],
    queryFn: () => resolveSettlementsRoute()({ query: mergedQuery }).unwrap(),
  } satisfies QueryOptions
}
