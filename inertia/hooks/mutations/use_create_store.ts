import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.stores.store')

export type CreateStorePayload = InferRequestType<typeof $route.$post>

export function useCreateStoreMutationOptions() {
  return {
    mutationFn: (data: CreateStorePayload) => {
      return tuyau.$route('api.v1.stores.store').$post(data).unwrap()
    },
  } satisfies MutationOptions
}
