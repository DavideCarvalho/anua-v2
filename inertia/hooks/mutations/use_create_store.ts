import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.stores.store')
export type CreateStorePayload = InferRequestType<ReturnType<typeof resolveRoute>['$post']>

export function useCreateStoreMutationOptions() {
  return {
    mutationFn: (data: CreateStorePayload) => {
      return tuyau.resolveRoute()('api.v1.stores.store').$post(data).unwrap()
    },
  } satisfies MutationOptions
}
