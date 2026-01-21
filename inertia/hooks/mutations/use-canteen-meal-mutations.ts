import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.canteenMeals.store')
type CreateCanteenMealPayload = InferRequestType<typeof $createRoute.$post>

const $updateRoute = tuyau.$route('api.v1.canteenMeals.update')
type UpdateCanteenMealPayload = InferRequestType<typeof $updateRoute.$put> & { id: string }

export function useCreateCanteenMeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCanteenMealPayload) => {
      return tuyau.$route('api.v1.canteenMeals.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-meals'] })
    },
  })
}

export function useUpdateCanteenMeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateCanteenMealPayload) => {
      return tuyau.$route('api.v1.canteenMeals.update', { id }).$put(data).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['canteen-meal', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['canteen-meals'] })
    },
  })
}

export function useDeleteCanteenMeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.canteenMeals.destroy', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-meals'] })
    },
  })
}
