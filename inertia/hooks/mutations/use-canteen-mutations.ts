import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.canteens.store')
type CreateCanteenPayload = InferRequestType<typeof $createRoute.$post>

const $updateRoute = tuyau.$route('api.v1.canteens.update')
type UpdateCanteenPayload = InferRequestType<typeof $updateRoute.$put> & { id: string }

export function useCreateCanteen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCanteenPayload) => {
      return tuyau.$route('api.v1.canteens.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteens'] })
    },
  })
}

export function useUpdateCanteen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateCanteenPayload) => {
      return tuyau.$route('api.v1.canteens.update', { id }).$put(data).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['canteen', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['canteens'] })
    },
  })
}

export function useDeleteCanteen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.canteens.destroy', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteens'] })
    },
  })
}
