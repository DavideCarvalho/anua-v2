import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.api.v1.teachers.absences.reject.$patch

type RejectAbsenceBody = Parameters<typeof $route>[0]

export function useRejectAbsenceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: RejectAbsenceBody) => {
      return $route(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', 'absences'] })
      queryClient.invalidateQueries({ queryKey: ['teachers', 'timesheet'] })
    },
  })
}
