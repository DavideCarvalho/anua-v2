import { mutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useDeleteStoreInstallmentRuleMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.storeInstallmentRules.destroy', { id }).$delete().unwrap()
    },
  })
}
