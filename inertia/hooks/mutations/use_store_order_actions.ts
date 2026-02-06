import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useApproveStoreOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.storeOrders.approve', { id }).$post({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-orders'] })
    },
  })
}

export function useRejectStoreOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => {
      return tuyau.$route('api.v1.storeOrders.reject', { id }).$post({ reason }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-orders'] })
    },
  })
}

export function useDeliverStoreOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.storeOrders.deliver', { id }).$post({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-orders'] })
    },
  })
}

export function useCancelStoreOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.storeOrders.cancel', { id }).$post({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-orders'] })
    },
  })
}
