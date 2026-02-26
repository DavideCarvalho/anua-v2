import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveCreateRoute = () => tuyau.$route('api.v1.challenges.store')
type CreateChallengePayload = InferRequestType<ReturnType<typeof resolveCreateRoute>['$post']>

const resolveUpdateRoute = () => tuyau.$route('api.v1.challenges.update')
type UpdateChallengePayload = InferRequestType<ReturnType<typeof resolveUpdateRoute>['$put']> & {
  id: string
}

export function useCreateChallenge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateChallengePayload) => {
      return tuyau.$route('api.v1.challenges.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] })
    },
  })
}

export function useUpdateChallenge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateChallengePayload) => {
      return tuyau.$route('api.v1.challenges.update', { id }).$put(data).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['challenge', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['challenges'] })
    },
  })
}

export function useDeleteChallenge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.challenges.destroy', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] })
    },
  })
}
