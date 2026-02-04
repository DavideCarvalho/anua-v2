import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.stores.store')
type CreateStorePayload = InferRequestType<typeof $createRoute.$post>

const $updateRoute = tuyau.$route('api.v1.stores.update')
type UpdateStorePayload = InferRequestType<typeof $updateRoute.$put> & { id: string }

export function useCreateStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStorePayload) => {
      return tuyau.$route('api.v1.stores.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })
}

export function useUpdateStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateStorePayload) => {
      return tuyau.$route('api.v1.stores.update', { id }).$put(data).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
      queryClient.invalidateQueries({ queryKey: ['store', variables.id] })
    },
  })
}

export function useDeleteStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.stores.destroy', { id }).$delete().unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })
}
