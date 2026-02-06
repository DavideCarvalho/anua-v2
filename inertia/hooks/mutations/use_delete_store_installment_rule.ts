import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useDeleteStoreInstallmentRuleMutationOptions() {
  return {
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.storeInstallmentRules.destroy', { id }).$delete().unwrap()
    },
  } satisfies MutationOptions
}
