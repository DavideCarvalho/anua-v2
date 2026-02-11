import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CreateOccurrencePayload {
  studentId: string
  teacherHasClassId: string
  type: 'BEHAVIOR' | 'PERFORMANCE' | 'ABSENCE' | 'LATE' | 'OTHER'
  text: string
  date: string
}

export function useCreateOccurrence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateOccurrencePayload) => {
      const response = await fetch('/api/v1/occurrences', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message || 'Erro ao criar ocorrencia')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
