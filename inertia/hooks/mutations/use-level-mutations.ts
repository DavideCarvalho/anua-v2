import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.levels.store')
type CreateLevelPayload = InferRequestType<typeof $createRoute.$post>

const $updateRoute = tuyau.$route('api.v1.levels.update')
type UpdateLevelPayload = InferRequestType<typeof $updateRoute.$put> & { id: string }

export function useCreateLevel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLevelPayload) => {
      return tuyau.$route('api.v1.levels.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] })
    },
  })
}

export function useUpdateLevel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateLevelPayload) => {
      return tuyau.$route('api.v1.levels.update', { id }).$put(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] })
    },
  })
}

export function useDeleteLevel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.levels.destroy', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] })
    },
  })
}
