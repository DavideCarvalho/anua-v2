import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.gamificationEvents.store')
type CreateGamificationEventPayload = InferRequestType<typeof $createRoute.$post>

export function useCreateGamificationEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGamificationEventPayload) => {
      return tuyau.$route('api.v1.gamificationEvents.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification-events'] })
    },
  })
}

export function useRetryGamificationEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.gamificationEvents.retry', { id }).$post({}).unwrap()
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['gamification-event', id] })
      queryClient.invalidateQueries({ queryKey: ['gamification-events'] })
    },
  })
}
