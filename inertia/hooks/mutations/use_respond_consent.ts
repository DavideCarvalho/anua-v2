import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.consents.respond')

type RespondParams = NonNullable<Parameters<typeof $route.$post>[0]>['params']
type RespondBody = NonNullable<Parameters<typeof $route.$post>[0]>

export function useRespondConsentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RespondParams & { approved: boolean; notes?: string }) => {
      const { id, approved, notes } = data
      return $route.$post({ params: { id }, approved, notes } as RespondBody).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parental-consents'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
