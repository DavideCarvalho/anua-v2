import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $updateRoute = tuyau.$route('api.v1.exams.update')
type UpdateExamPayload = InferRequestType<typeof $updateRoute.$put> & { id: string }

export function useUpdateExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateExamPayload) => {
      return tuyau.$route('api.v1.exams.update', { id }).$put(data).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['exams'] })
    },
  })
}

export function useDeleteExam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.exams.destroy', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] })
    },
  })
}

// Update existing grade
export function useUpdateExamGrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      examId,
      gradeId,
      score,
      feedback,
    }: {
      examId: string
      gradeId: string
      score: number
      feedback?: string
    }) => {
      return tuyau
        .$route('api.v1.exams.updateGrade', { id: examId, gradeId })
        .$put({ score, feedback })
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam-grades', { examId: variables.examId }] })
      queryClient.invalidateQueries({ queryKey: ['exam', variables.examId] })
    },
  })
}
