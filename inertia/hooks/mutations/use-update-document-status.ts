import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.enrollments.documents.updateStatus')

type UpdateDocumentStatusParams = NonNullable<Parameters<typeof $route.$put>[0]>['params']

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
      return $route.$put({ params: { id }, status, rejectionReason } as any).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
