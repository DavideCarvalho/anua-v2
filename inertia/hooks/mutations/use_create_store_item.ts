import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.storeItems.store')
export type CreateStoreItemPayload = InferRequestType<ReturnType<typeof resolveRoute>['$post']>

export function useCreateStoreItemMutationOptions() {
  return {
    mutationFn: (data: CreateStoreItemPayload) => {
      return tuyau.$route('api.v1.storeItems.store').$post(data).unwrap()
    },
  } satisfies MutationOptions
}
