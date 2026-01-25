import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.students.store')
type CreateStudentPayload = InferRequestType<typeof $createRoute.$post>

const $enrollRoute = tuyau.$route('api.v1.students.enroll')
type EnrollStudentPayload = InferRequestType<typeof $enrollRoute.$post>

const $fullUpdateRoute = tuyau.$route('api.v1.students.fullUpdate')
type FullUpdateStudentPayload = InferRequestType<typeof $fullUpdateRoute.$put> & { id: string }

const $updateRoute = tuyau.$route('api.v1.students.update')
type UpdateStudentPayload = InferRequestType<typeof $updateRoute.$put> & { id: string }

export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStudentPayload) => {
      return tuyau.$route('api.v1.students.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateStudentPayload) => {
      return tuyau.$route('api.v1.students.update', { id }).$put(data).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export function useDeleteStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.students.destroy', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export function useEnrollStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EnrollStudentPayload) => {
      return tuyau.$route('api.v1.students.enroll').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export function useFullUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: FullUpdateStudentPayload) => {
      return tuyau.$route('api.v1.students.fullUpdate', { id }).$put(data).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
