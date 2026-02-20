import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const resolveRoute = () => tuyau.api.v1.teachers.absences.approve.$patch

type ApproveAbsenceBody = Parameters<ReturnType<typeof resolveRoute>>[0]

export function useApproveAbsenceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ApproveAbsenceBody) => {
      return resolveRoute()(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', 'absences'] })
      queryClient.invalidateQueries({ queryKey: ['teachers', 'timesheet'] })
    },
  })
}
