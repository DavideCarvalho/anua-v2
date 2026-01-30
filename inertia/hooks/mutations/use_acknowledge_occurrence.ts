import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useAcknowledgeOccurrence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      studentId,
      occurrenceId,
    }: {
      studentId: string
      occurrenceId: string
    }) => {
      const response = await tuyau
        .$route('api.v1.responsavel.api.acknowledgeOccurrence', { studentId, occurrenceId })
        .$post()

      if (response.error) {
        throw new Error((response.error as any).value?.message || 'Erro ao reconhecer ocorrencia')
      }
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['responsavel', 'students', variables.studentId, 'occurrences'],
      })
    },
  })
}
