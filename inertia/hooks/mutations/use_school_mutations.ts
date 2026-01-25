import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $updateRoute = tuyau.$route('api.v1.schools.update')
type UpdateSchoolPayload = InferRequestType<typeof $updateRoute.$put> & { id: string }

export function useUpdateSchool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateSchoolPayload) => {
      return tuyau.$route('api.v1.schools.update', { id }).$put(data).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['school', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['schools'] })
    },
  })
}
