import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.achievements.store')
type CreateAchievementPayload = InferRequestType<typeof $createRoute.$post>

const $updateRoute = tuyau.$route('api.v1.achievements.update')
type UpdateAchievementPayload = InferRequestType<typeof $updateRoute.$put> & { id: string }

export function useCreateAchievement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAchievementPayload) => {
      return tuyau.$route('api.v1.achievements.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    },
  })
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateAchievementPayload) => {
      return tuyau.$route('api.v1.achievements.update', { id }).$put(data).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['achievement', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    },
  })
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.achievements.destroy', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    },
  })
}

export function useUnlockAchievement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => {
      return tuyau.$route('api.v1.achievements.unlock', { id }).$post({ userId }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] })
    },
  })
}
