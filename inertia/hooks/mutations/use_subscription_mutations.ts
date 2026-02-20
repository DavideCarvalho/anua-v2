import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

// Subscription Plan mutations
const resolveCreatePlanRoute = () => tuyau.$route('api.v1.subscriptionPlans.store')
type CreatePlanPayload = InferRequestType<ReturnType<typeof resolveCreatePlanRoute>['$post']>

export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePlanPayload) => {
      return tuyau.$route('api.v1.subscriptionPlans.store').$post(data).unwrap()
    },
    onSuccess: () => {
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

// Subscription mutations
export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau
        .$route('api.v1.subscriptions.cancel', { id })
        .$post({} as any)
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    },
  })
}

export function usePauseSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.subscriptions.pause', { id }).$post({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    },
  })
}

export function useReactivateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.subscriptions.reactivate', { id }).$post({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    },
  })
}

// Invoice mutations
export function useMarkInvoicePaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.subscriptionInvoices.markPaid', { id }).$post({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-invoices'] })
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    },
  })
}
