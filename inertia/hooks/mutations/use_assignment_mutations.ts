import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveUpdateRoute = () => tuyau.$route('api.v1.assignments.update')
type UpdateAssignmentPayload = InferRequestType<ReturnType<typeof resolveUpdateRoute>['$put']> & {
  id: string
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateAssignmentPayload) => {
      return tuyau.$route('api.v1.assignments.update', { id }).$put(data).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assignment', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.assignments.destroy', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

// Student submission
export function useSubmitAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assignmentId, studentId }: { assignmentId: string; studentId: string }) => {
      return tuyau
        .$route('api.v1.assignments.submit', { id: assignmentId })
        .$post({ studentId })
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assignment', variables.assignmentId] })
      queryClient.invalidateQueries({
        queryKey: ['assignment-submissions', { assignmentId: variables.assignmentId }],
      })
    },
  })
}
