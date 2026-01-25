import { tuyau } from '../../lib/api'
import { useMutation } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.enrollment.checkExisting')

type CheckExistingBody = {
  document?: string
  email?: string
  levelId: string
}

export function useCheckExistingStudentMutation() {
  return useMutation({
    mutationFn: (data: CheckExistingBody) => {
      return $route.$post(data as any).unwrap()
    },
  })
}
