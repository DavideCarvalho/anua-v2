import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.studentGamifications.store')
type CreateStudentGamificationPayload = InferRequestType<typeof $createRoute.$post>

export function useCreateStudentGamification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStudentGamificationPayload) => {
      return tuyau.$route('api.v1.studentGamifications.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-gamifications'] })
      queryClient.invalidateQueries({ queryKey: ['gamification-ranking'] })
    },
  })
}

export function useAddStudentPoints() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, points, reason }: { id: string; points: number; reason?: string }) => {
      return tuyau
        .$route('api.v1.studentGamifications.addPoints', { id })
        .$post({ points, reason })
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-gamification', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['student-gamifications'] })
      queryClient.invalidateQueries({ queryKey: ['gamification-ranking'] })
    },
  })
}
