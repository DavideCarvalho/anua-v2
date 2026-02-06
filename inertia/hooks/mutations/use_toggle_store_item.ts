import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useToggleStoreItemMutationOptions() {
  return {
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.storeItems.toggleActive', { id }).$patch({}).unwrap()
    },
  } satisfies MutationOptions
}
