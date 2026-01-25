import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.api.v1['school-partners'].$post

type CreateSchoolPartnerBody = Parameters<typeof $route>[0]

export function useCreateSchoolPartnerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateSchoolPartnerBody) => {
      return $route(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-partners'] })
    },
  })
}
