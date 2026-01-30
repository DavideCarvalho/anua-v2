import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.canteenPurchases.store')
type CreateCanteenPurchasePayload = InferRequestType<typeof $createRoute.$post>

export function useCreateCanteenPurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCanteenPurchasePayload) => {
      return tuyau.$route('api.v1.canteenPurchases.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-purchases'] })
    },
  })
}

export function useUpdateCanteenPurchaseStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      return tuyau
        .$route('api.v1.canteenPurchases.updateStatus', { id })
        .$put({ status } as any)
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['canteen-purchase', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['canteen-purchases'] })
    },
  })
}

export function useCancelCanteenPurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.canteenPurchases.cancel', { id }).$post({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-purchases'] })
    },
  })
}
