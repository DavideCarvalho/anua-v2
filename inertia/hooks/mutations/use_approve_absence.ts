import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.api.v1.teachers.absences.approve.$patch

type ApproveAbsenceBody = Parameters<typeof $route>[0]

export function useApproveAbsenceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ApproveAbsenceBody) => {
      return $route(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', 'absences'] })
      queryClient.invalidateQueries({ queryKey: ['teachers', 'timesheet'] })
    },
  })
}
