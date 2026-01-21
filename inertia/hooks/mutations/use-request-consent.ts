import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.events.consents.request')

type RequestConsentParams = NonNullable<Parameters<typeof $route.$post>[0]>['params']
type RequestConsentBody = {
  studentId: string
  responsibleId: string
}

export function useRequestConsentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RequestConsentParams & RequestConsentBody) => {
      const { eventId, studentId, responsibleId } = data
      return $route
        .$post({ params: { eventId }, studentId, responsibleId } as any)
        .unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'consents'] })
      queryClient.invalidateQueries({ queryKey: ['parental-consents'] })
    },
  })
}
