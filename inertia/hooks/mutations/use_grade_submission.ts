import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface GradeSubmissionData {
  assignmentId: string
  submissionId: string
  score: number
  feedback?: string
}

export function useGradeSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assignmentId, submissionId, score, feedback }: GradeSubmissionData) => {
      return (tuyau as any)
        .$route('api.v1.assignments.submissions.grade', { id: assignmentId, submissionId })
        .$post({ score, feedback })
        .unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assignment', variables.assignmentId] })
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}
