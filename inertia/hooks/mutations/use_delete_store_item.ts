import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useDeleteStoreItemMutationOptions() {
  return {
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.storeItems.destroy', { id }).$delete().unwrap()
    },
  } satisfies MutationOptions
}
