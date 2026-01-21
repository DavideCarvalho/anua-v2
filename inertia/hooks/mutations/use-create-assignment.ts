import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface CreateAssignmentData {
  title: string
  description?: string
  instructions?: string
  maxScore: number
  dueDate: string
  classId: string
  subjectId: string
  teacherId: string
  status?: 'DRAFT' | 'PUBLISHED'
}

export function useCreateAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAssignmentData) => {
      return tuyau.$route('api.v1.assignments.store').$post({ ...data }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}
