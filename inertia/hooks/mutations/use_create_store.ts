import { mutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.stores.store')
export type CreateStorePayload = InferRequestType<ReturnType<typeof resolveRoute>['$post']>

export function useCreateStoreMutationOptions() {
  return mutationOptions({
    mutationFn: (data: CreateStorePayload) => {
      return tuyau.$route('api.v1.stores.store').$post(data).unwrap()
    },
  })
}
