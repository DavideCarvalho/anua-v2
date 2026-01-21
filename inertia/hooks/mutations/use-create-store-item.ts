import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.storeItems.store')

type CreateStoreItemPayload = InferRequestType<typeof $route.$post>

export function useCreateStoreItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStoreItemPayload) => {
      return tuyau.$route('api.v1.storeItems.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-items'] })
    },
  })
}
