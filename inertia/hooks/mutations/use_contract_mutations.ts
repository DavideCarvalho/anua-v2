import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useDeleteContractMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contractId: string) => {
      return tuyau.$route('api.v1.contracts.destroy', { id: contractId }).$delete().unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}
