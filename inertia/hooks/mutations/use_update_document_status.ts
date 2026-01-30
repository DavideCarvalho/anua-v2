import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type UpdateDocumentStatusData = {
  id: string
  status: 'APPROVED' | 'REJECTED'
  rejectionReason?: string
}

export function useUpdateDocumentStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateDocumentStatusData) => {
      const { id, status, rejectionReason } = data
      return tuyau.$route('api.v1.enrollments.documents.updateStatus', { id }).$put({ status, rejectionReason } as any).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
