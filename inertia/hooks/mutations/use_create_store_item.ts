import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.storeItems.store')

export type CreateStoreItemPayload = InferRequestType<typeof $route.$post>

export function useCreateStoreItemMutationOptions() {
  return {
    mutationFn: (data: CreateStoreItemPayload) => {
      return tuyau.$route('api.v1.storeItems.store').$post(data).unwrap()
    },
  } satisfies MutationOptions
}
