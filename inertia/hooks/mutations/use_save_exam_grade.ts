import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface SaveExamGradeData {
  examId: string
  studentId: string
  score: number
  feedback?: string
  absent?: boolean
}

export function useSaveExamGrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ examId, studentId, score, feedback, absent }: SaveExamGradeData) => {
      return (tuyau as any)
        .$route('api.v1.exams.grades.store', { id: examId })
        .$post({ studentId, score, feedback, absent })
        .unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam', variables.examId] })
      queryClient.invalidateQueries({ queryKey: ['exams'] })
    },
  })
}
