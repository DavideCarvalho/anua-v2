import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

// Product mutations
const $createProduct = tuyau.$route('api.v1.storeOwner.products.store')
type CreateProductPayload = InferRequestType<typeof $createProduct.$post>

const $updateProduct = tuyau.$route('api.v1.storeOwner.products.update')
type UpdateProductPayload = InferRequestType<typeof $updateProduct.$put> & { id: string }

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductPayload) =>
      tuyau.$route('api.v1.storeOwner.products.store').$post(data).unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'products'] })
    },
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateProductPayload) =>
      tuyau.$route('api.v1.storeOwner.products.update', { id }).$put(data).unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'products'] })
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      tuyau.$route('api.v1.storeOwner.products.destroy', { id }).$delete().unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'products'] })
    },
  })
}

export function useToggleProductActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      tuyau.$route('api.v1.storeOwner.products.toggleActive', { id }).$patch().unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'products'] })
    },
  })
}

// Order action mutations
export function useApproveOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      tuyau.$route('api.v1.storeOwner.orders.approve', { id }).$post().unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'orders'] })
    },
  })
}

export function useRejectOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      tuyau.$route('api.v1.storeOwner.orders.reject', { id }).$post({ reason }).unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'orders'] })
    },
  })
}

export function useMarkPreparing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      tuyau.$route('api.v1.storeOwner.orders.preparing', { id }).$post().unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'orders'] })
    },
  })
}

export function useMarkReady() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      tuyau.$route('api.v1.storeOwner.orders.ready', { id }).$post().unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'orders'] })
    },
  })
}

export function useDeliverOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      tuyau.$route('api.v1.storeOwner.orders.deliver', { id }).$post().unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'orders'] })
    },
  })
}

// Financial settings mutation
const $updateFinancial = tuyau.$route('api.v1.storeOwner.financial.update')
type UpdateFinancialPayload = InferRequestType<typeof $updateFinancial.$put>

export function useUpdateFinancialSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateFinancialPayload) =>
      tuyau.$route('api.v1.storeOwner.financial.update').$put(data).unwrap(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storeOwner', 'financial'] })
    },
  })
}
