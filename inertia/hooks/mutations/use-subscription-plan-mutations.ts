import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.subscriptionPlans.store')
type CreateSubscriptionPlanPayload = InferRequestType<typeof $createRoute.$post>

const $updateRoute = tuyau.$route('api.v1.subscriptionPlans.update')
type UpdateSubscriptionPlanPayload = InferRequestType<typeof $updateRoute.$put> & { id: string }

export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSubscriptionPlanPayload) => {
      return tuyau.$route('api.v1.subscriptionPlans.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
    },
  })
}

export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateSubscriptionPlanPayload) => {
      return tuyau.$route('api.v1.subscriptionPlans.update', { id }).$put(data).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plan', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
    },
  })
}

export function useDeleteSubscriptionPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.subscriptionPlans.destroy', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
    },
  })
}
