import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.classes.store')
type CreateClassPayload = InferRequestType<typeof $createRoute.$post>

const $createWithTeachersRoute = tuyau.$route('api.v1.classes.storeWithTeachers')
type CreateClassWithTeachersPayload = InferRequestType<typeof $createWithTeachersRoute.$post>

const $updateRoute = tuyau.$route('api.v1.classes.update')
type UpdateClassPayload = InferRequestType<typeof $updateRoute.$put> & { id: string }

export function useCreateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClassPayload) => {
      return tuyau.$route('api.v1.classes.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

export function useCreateClassWithTeachers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClassWithTeachersPayload) => {
      return tuyau.$route('api.v1.classes.storeWithTeachers').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

export function useUpdateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateClassPayload) => {
      return tuyau.$route('api.v1.classes.update', { id }).$put(data).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

export function useDeleteClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.classes.destroy', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}
