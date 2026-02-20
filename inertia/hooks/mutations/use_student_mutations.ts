import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveCreateRoute = () => tuyau.$route('api.v1.students.store')
type CreateStudentPayload = InferRequestType<ReturnType<typeof resolveCreateRoute>['$post']>

const resolveEnrollRoute = () => tuyau.$route('api.v1.students.enroll')
type EnrollStudentPayload = InferRequestType<ReturnType<typeof resolveEnrollRoute>['$post']>

const resolveFullUpdateRoute = () => tuyau.$route('api.v1.students.fullUpdate')
type FullUpdateStudentPayload = InferRequestType<
  ReturnType<typeof resolveFullUpdateRoute>['$put']
> & { id: string }

const resolveUpdateRoute = () => tuyau.$route('api.v1.students.update')
type UpdateStudentPayload = InferRequestType<ReturnType<typeof resolveUpdateRoute>['$put']> & {
  id: string
}

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
