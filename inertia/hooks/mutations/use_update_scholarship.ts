import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const resolveRoute = () => tuyau.api.v1.scholarships({ id: '' }).$put

type ScholarshipParams = Parameters<typeof tuyau.api.v1.scholarships>[0]
type UpdateScholarshipBody = Parameters<ReturnType<typeof resolveRoute>>[0]

export function useUpdateScholarshipMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ params, body }: { params: ScholarshipParams; body: UpdateScholarshipBody }) => {
      return tuyau.api.v1.scholarships(params).$put(body).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] })
      queryClient.invalidateQueries({ queryKey: ['scholarship', variables.params] })
    },
  })
}
