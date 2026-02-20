import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.storeItems.update')
export type UpdateStoreItemPayload = InferRequestType<ReturnType<typeof resolveRoute>['$put']> & {
  id: string
}

export function useUpdateStoreItemMutationOptions() {
  return {
    mutationFn: ({ id, ...data }: UpdateStoreItemPayload) => {
      return tuyau.resolveRoute()('api.v1.storeItems.update', { id }).$put(data).unwrap()
    },
  } satisfies MutationOptions
}
