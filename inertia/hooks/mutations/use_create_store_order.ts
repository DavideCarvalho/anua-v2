import type { InferRequestType } from '@tuyau/client'
import { mutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

const resolveRoute = () => tuyau.$route('api.v1.storeOrders.store')
export type CreateStoreOrderPayload = InferRequestType<ReturnType<typeof resolveRoute>['$post']>

export function useCreateStoreOrderMutationOptions() {
  return mutationOptions({
    mutationFn: (data: CreateStoreOrderPayload) => resolveRoute().$post(data).unwrap(),
  })
}
