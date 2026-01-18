import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type ScholarshipParams = Parameters<typeof tuyau.api.v1.scholarships>[0]

export function useToggleScholarshipActiveMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: ScholarshipParams) => {
      return tuyau.api.v1.scholarships(params)['toggle-active'].$patch().unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] })
    },
  })
}
