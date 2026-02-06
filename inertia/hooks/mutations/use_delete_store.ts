import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useDeleteStoreMutationOptions() {
  return {
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.stores.destroy', { id }).$delete().unwrap()
    },
  } satisfies MutationOptions
}
