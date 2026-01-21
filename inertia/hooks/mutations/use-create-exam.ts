import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface CreateExamData {
  title: string
  description?: string
  instructions?: string
  maxScore: number
  type: 'WRITTEN' | 'ORAL' | 'PRACTICAL' | 'PROJECT' | 'QUIZ'
  scheduledDate: string
  durationMinutes?: number
  classId: string
  subjectId: string
  teacherId: string
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'
}

export function useCreateExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExamData) => {
      return tuyau.$route('api.v1.exams.store').$post({ ...data }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] })
    },
  })
}
