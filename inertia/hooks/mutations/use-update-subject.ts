import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type SubjectParams = Parameters<typeof tuyau.api.v1.subjects>[0]

const $route = tuyau.api.v1.subjects({ id: '' }).$put

type UpdateSubjectBody = Parameters<typeof $route>[0]

export function useUpdateSubjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ params, body }: { params: SubjectParams; body: UpdateSubjectBody }) => {
      return tuyau.api.v1.subjects(params).$put(body).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      queryClient.invalidateQueries({ queryKey: ['subject', variables.params] })
    },
  })
}
