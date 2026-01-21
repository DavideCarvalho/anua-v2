import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useAcknowledgeOccurrence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ studentId, occurrenceId }: { studentId: string; occurrenceId: string }) => {
      const response = await tuyau.api.v1.responsavel.students[':studentId'].occurrences[
        ':occurrenceId'
      ].acknowledge.$post({
        params: { studentId, occurrenceId },
      })

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao reconhecer ocorrencia')
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
