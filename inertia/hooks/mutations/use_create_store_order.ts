import type { InferRequestType } from '@tuyau/client'
import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

const resolveRoute = () => tuyau.$route('api.v1.storeOrders.store')
export type CreateStoreOrderPayload = InferRequestType<ReturnType<typeof resolveRoute>['$post']>

export function useCreateStoreOrderMutationOptions() {
  return {
    mutationFn: (data: CreateStoreOrderPayload) => resolveRoute().$post(data).unwrap(),
  } satisfies MutationOptions<unknown, Error, CreateStoreOrderPayload>
}
