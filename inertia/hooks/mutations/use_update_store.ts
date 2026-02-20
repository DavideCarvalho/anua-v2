import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.stores.update')
export type UpdateStorePayload = InferRequestType<ReturnType<typeof resolveRoute>['$put']> & {
  id: string
}

export function useUpdateStoreMutationOptions() {
  return {
    mutationFn: ({ id, ...data }: UpdateStorePayload) => {
      return tuyau.$route('api.v1.stores.update', { id }).$put(data).unwrap()
    },
  } satisfies MutationOptions
}
