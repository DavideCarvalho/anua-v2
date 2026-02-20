import { tuyau } from '../../lib/api'
import { useMutation } from '@tanstack/react-query'

const resolveRoute = () => tuyau.$route('api.v1.enrollment.checkExisting')
type CheckExistingBody = {
  document?: string
  email?: string
  levelId: string
}

export function useCheckExistingStudentMutation() {
  return useMutation({
    mutationFn: (data: CheckExistingBody) => {
      return resolveRoute()
        .$post(data as any)
        .unwrap()
    },
  })
}
