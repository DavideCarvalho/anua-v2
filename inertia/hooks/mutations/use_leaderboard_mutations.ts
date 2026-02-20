import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveCreateRoute = () => tuyau.$route('api.v1.leaderboards.store')
type CreateLeaderboardPayload = InferRequestType<ReturnType<typeof resolveCreateRoute>['$post']>

const resolveUpdateRoute = () => tuyau.$route('api.v1.leaderboards.update')
type UpdateLeaderboardPayload = InferRequestType<ReturnType<typeof resolveUpdateRoute>['$put']> & {
  id: string
}

export function useCreateLeaderboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLeaderboardPayload) => {
      return tuyau.$route('api.v1.leaderboards.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboards'] })
    },
  })
}

export function useUpdateLeaderboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateLeaderboardPayload) => {
      return tuyau.$route('api.v1.leaderboards.update', { id }).$put(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboards'] })
    },
  })
}

export function useDeleteLeaderboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.leaderboards.destroy', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboards'] })
    },
  })
}
