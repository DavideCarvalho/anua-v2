import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface BatchSaveGradesPayload {
  assignmentId: string
  grades: {
    studentId: string
    grade: number | null
    submittedAt: string | null
  }[]
}

export function useBatchSaveGrades() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BatchSaveGradesPayload) => {
      return tuyau
        .$route('api.v1.grades.batchSave')
        .$post({ ...data })
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subject-grades'] })
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['assignment-grades', variables.assignmentId] })
    },
  })
}
