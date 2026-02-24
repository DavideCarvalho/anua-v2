import { mutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useToggleStoreItemMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.storeItems.toggleActive', { id }).$patch({}).unwrap()
    },
  })
}
