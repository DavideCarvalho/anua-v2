import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.userSchoolGroups.createUserSchoolGroup')
type CreateUserSchoolGroupPayload = InferRequestType<typeof $createRoute.$post>

export function useCreateUserSchoolGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserSchoolGroupPayload) => {
      return tuyau.$route('api.v1.userSchoolGroups.createUserSchoolGroup').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-school-groups'] })
    },
  })
}

export function useDeleteUserSchoolGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, schoolGroupId }: { userId: string; schoolGroupId: string }) => {
      return tuyau
        .$route('api.v1.userSchoolGroups.deleteUserSchoolGroup', { userId, schoolGroupId })
        .$delete({})
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-school-groups'] })
    },
  })
}
