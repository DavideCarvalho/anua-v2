import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useReviewPrintRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      id: string
      name: string
      dueDate: string
      fileUrl: string
      quantity: number
      frontAndBack?: boolean
    }) => {
      const { id, ...body } = data
      return tuyau
        .$route('api.v1.printRequests.reviewPrintRequest', { id })
        .$patch(body as any)
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-requests'] })
    },
  })
}
