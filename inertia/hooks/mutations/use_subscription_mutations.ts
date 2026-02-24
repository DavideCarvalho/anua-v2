import { mutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

// Subscription Plan mutations
const resolveCreatePlanRoute = () => tuyau.$route('api.v1.subscriptionPlans.store')
type CreatePlanPayload = InferRequestType<ReturnType<typeof resolveCreatePlanRoute>['$post']>

export function useCreateSubscriptionPlanMutationOptions() {
  return mutationOptions({
    mutationFn: (data: CreatePlanPayload) => {
      return tuyau.$route('api.v1.subscriptionPlans.store').$post(data).unwrap()
    },
  })
}

export function useDeleteSubscriptionPlanMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.subscriptionPlans.destroy', { id }).$delete({}).unwrap()
    },
  })
}

// Subscription mutations
interface CancelSubscriptionPayload {
  id: string
  reason?: string
}

export function useCancelSubscriptionMutationOptions() {
  return mutationOptions({
    mutationFn: ({ id, reason }: CancelSubscriptionPayload) => {
      return tuyau
        .$route('api.v1.subscriptions.cancel', { id })
        .$post({ reason: reason ?? 'Cancelada pelo administrador' })
        .unwrap()
    },
  })
}

export function usePauseSubscriptionMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.subscriptions.pause', { id }).$post({}).unwrap()
    },
  })
}

export function useReactivateSubscriptionMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.subscriptions.reactivate', { id }).$post({}).unwrap()
    },
  })
}

// Invoice mutations
export function useMarkSubscriptionInvoicePaidMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.subscriptionInvoices.markPaid', { id }).$post({}).unwrap()
    },
  })
}
