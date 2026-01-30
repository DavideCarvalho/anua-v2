import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useRejectPrintRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: string; reason: string }) => {
      const { id, ...body } = data
      return tuyau
        .$route('api.v1.printRequests.rejectPrintRequest', { id })
        .$patch(body as any)
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-requests'] })
    },
  })
}
