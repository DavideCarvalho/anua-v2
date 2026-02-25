import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface GradeSubmissionData {
  assignmentId: string
  submissionId: string
  grade: number
}

export function useGradeSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assignmentId, submissionId, grade }: GradeSubmissionData) => {
      return tuyau
        .$route('api.v1.assignments.submissions.grade', { id: assignmentId, submissionId })
        .$post({ grade })
        .unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assignment', variables.assignmentId] })
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}
