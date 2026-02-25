import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useRequestConsentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { eventId: string; studentId: string; responsibleId: string }) => {
      const { studentId, responsibleId } = data
      return tuyau
        .$route('api.v1.events.consents.request')
        .$post({ studentId, responsibleId })
        .unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'consents'] })
      queryClient.invalidateQueries({ queryKey: ['parental-consents'] })
    },
  })
}
