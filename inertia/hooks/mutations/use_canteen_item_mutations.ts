import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveCreateRoute = () => tuyau.$route('api.v1.canteenItems.store')
type CreateCanteenItemPayload = InferRequestType<ReturnType<typeof resolveCreateRoute>['$post']>

const resolveUpdateRoute = () => tuyau.$route('api.v1.canteenItems.update')
type UpdateCanteenItemPayload = InferRequestType<ReturnType<typeof resolveUpdateRoute>['$put']> & {
  id: string
}

export function useCreateCanteenItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCanteenItemPayload) => {
      return tuyau.$route('api.v1.canteenItems.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-items'] })
    },
  })
}

export function useUpdateCanteenItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateCanteenItemPayload) => {
      return tuyau.$route('api.v1.canteenItems.update', { id }).$put(data).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['canteen-item', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['canteen-items'] })
    },
  })
}

export function useDeleteCanteenItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.canteenItems.destroy', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-items'] })
    },
  })
}

export function useToggleCanteenItemActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.canteenItems.toggleActive', { id }).$get().unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-items'] })
    },
  })
}
