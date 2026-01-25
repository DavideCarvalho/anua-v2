import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.courses.store')
type CreateCoursePayload = InferRequestType<typeof $createRoute.$post>

const $updateRoute = tuyau.$route('api.v1.courses.update')
type UpdateCoursePayload = InferRequestType<typeof $updateRoute.$put> & { id: string }

export function useCreateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCoursePayload) => {
      return tuyau.$route('api.v1.courses.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}

export function useUpdateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateCoursePayload) => {
      return tuyau.$route('api.v1.courses.update', { id }).$put(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.courses.destroy', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}
