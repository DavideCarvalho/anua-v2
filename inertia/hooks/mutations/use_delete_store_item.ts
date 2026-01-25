import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useDeleteStoreItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.storeItems.destroy', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-items'] })
    },
  })
}
