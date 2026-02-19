import { useMutation } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.students.enrollments.update')

export type UpdateEnrollmentPayload = InferRequestType<typeof $route.$patch>

interface UpdateEnrollmentParams {
  studentId: string
  enrollmentId: string
  data: UpdateEnrollmentPayload
}

export function useUpdateEnrollment() {
  return useMutation({
    mutationFn: ({ studentId, enrollmentId, data }: UpdateEnrollmentParams) => {
      return tuyau
        .$route('api.v1.students.enrollments.update', { id: studentId, enrollmentId })
        .$patch(data)
        .unwrap()
    },
  })
}
