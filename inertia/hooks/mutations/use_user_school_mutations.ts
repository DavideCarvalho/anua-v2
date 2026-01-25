import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.userSchools.createUserSchool')
type CreateUserSchoolPayload = InferRequestType<typeof $createRoute.$post>

const $updateRoute = tuyau.$route('api.v1.userSchools.updateUserSchool')
type UpdateUserSchoolPayload = InferRequestType<typeof $updateRoute.$put> & { id: string }

export function useCreateUserSchool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserSchoolPayload) => {
      return tuyau.$route('api.v1.userSchools.createUserSchool').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-schools'] })
    },
  })
}

export function useUpdateUserSchool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateUserSchoolPayload) => {
      return tuyau.$route('api.v1.userSchools.updateUserSchool', { id }).$put(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-schools'] })
    },
  })
}

export function useDeleteUserSchool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.userSchools.deleteUserSchool', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-schools'] })
    },
  })
}
