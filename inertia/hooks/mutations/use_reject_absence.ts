import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const resolveRoute = () => tuyau.api.v1.teachers.absences.reject.$patch

type RejectAbsenceBody = Parameters<ReturnType<typeof resolveRoute>>[0]

export function useRejectAbsenceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: RejectAbsenceBody) => {
      return resolveRoute()(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', 'absences'] })
      queryClient.invalidateQueries({ queryKey: ['teachers', 'timesheet'] })
    },
  })
}
