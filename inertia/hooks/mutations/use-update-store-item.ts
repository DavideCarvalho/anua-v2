import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.storeItems.update')

type UpdateStoreItemPayload = InferRequestType<typeof $route.$put> & { id: string }

export function useUpdateStoreItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateStoreItemPayload) => {
      return tuyau.$route('api.v1.storeItems.update', { id }).$put(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-items'] })
    },
  })
}
