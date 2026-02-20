import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const resolveRoute = () => tuyau.api.v1['school-partners'].$post

type CreateSchoolPartnerBody = Parameters<ReturnType<typeof resolveRoute>>[0]

export function useCreateSchoolPartnerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateSchoolPartnerBody) => {
      return resolveRoute()(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-partners'] })
    },
  })
}
