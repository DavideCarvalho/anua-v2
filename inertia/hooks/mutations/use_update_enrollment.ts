import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.students.enrollments.update')
export type UpdateEnrollmentPayload = InferRequestType<ReturnType<typeof resolveRoute>['$patch']>

interface UpdateEnrollmentParams {
  studentId: string
  enrollmentId: string
  data: UpdateEnrollmentPayload
}

export function useUpdateEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, enrollmentId, data }: UpdateEnrollmentParams) => {
      return tuyau
        .resolveRoute()('api.v1.students.enrollments.update', { id: studentId, enrollmentId })
        .$patch(data)
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.studentId] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

interface CancelEnrollmentParams {
  studentId: string
  enrollmentId: string
}

export function useCancelEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, enrollmentId }: CancelEnrollmentParams) => {
      return tuyau
        .resolveRoute()('api.v1.students.enrollments.cancel', { id: studentId, enrollmentId })
        .$delete({})
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.studentId] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
