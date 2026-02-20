import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveCreateRoute = () => tuyau.$route('api.v1.subscriptionInvoices.store')
type CreateSubscriptionInvoicePayload = InferRequestType<
  ReturnType<typeof resolveCreateRoute>['$post']
>

const resolveUpdateRoute = () => tuyau.$route('api.v1.subscriptionInvoices.update')
type UpdateSubscriptionInvoicePayload = InferRequestType<
  ReturnType<typeof resolveUpdateRoute>['$put']
> & { id: string }

export function useCreateSubscriptionInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSubscriptionInvoicePayload) => {
      return tuyau.$route('api.v1.subscriptionInvoices.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-invoices'] })
    },
  })
}

export function useUpdateSubscriptionInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateSubscriptionInvoicePayload) => {
      return tuyau.$route('api.v1.subscriptionInvoices.update', { id }).$put(data).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-invoice', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['subscription-invoices'] })
    },
  })
}

export function useMarkSubscriptionInvoicePaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, paidAt }: { id: string; paidAt?: string }) => {
      return tuyau.$route('api.v1.subscriptionInvoices.markPaid', { id }).$post({ paidAt }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-invoices'] })
    },
  })
}
