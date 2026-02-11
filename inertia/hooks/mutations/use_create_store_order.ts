import type { InferRequestType } from '@tuyau/client'
import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

const $route = tuyau.$route('api.v1.storeOrders.store')

export type CreateStoreOrderPayload = InferRequestType<typeof $route.$post>

export function useCreateStoreOrderMutationOptions() {
  return {
    mutationFn: (data: CreateStoreOrderPayload) => $route.$post(data).unwrap(),
  } satisfies MutationOptions<unknown, Error, CreateStoreOrderPayload>
}
