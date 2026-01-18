import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type SchoolPartnerParams = Parameters<(typeof tuyau.api.v1)['school-partners']>[0]

const $route = tuyau.api.v1['school-partners']({ id: '' }).$put

type UpdateSchoolPartnerBody = Parameters<typeof $route>[0]

export function useUpdateSchoolPartnerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      params,
      body,
    }: {
      params: SchoolPartnerParams
      body: UpdateSchoolPartnerBody
    }) => {
      return tuyau.api.v1['school-partners'](params).$put(body).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['school-partners'] })
      queryClient.invalidateQueries({ queryKey: ['school-partner', variables.params] })
    },
  })
}
