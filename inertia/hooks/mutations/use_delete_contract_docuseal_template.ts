import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useDeleteContractDocusealTemplateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contractId }: { contractId: string }) => {
      return tuyau
        .$route('api.v1.contracts.deleteDocusealTemplate', { contractId })
        .$delete()
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['contracts', 'docuseal-template', { contractId: variables.contractId }],
      })
    },
  })
}
