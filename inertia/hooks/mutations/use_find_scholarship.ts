import { tuyau } from '../../lib/api'
import { useMutation } from '@tanstack/react-query'

const resolveRoute = () => tuyau.$route('api.v1.enrollment.findScholarship')
type FindScholarshipBody = {
  code: string
  schoolId: string
}

export function useFindScholarshipMutation() {
  return useMutation({
    mutationFn: (data: FindScholarshipBody) => {
      return resolveRoute()
        .$post(data as any)
        .unwrap()
    },
  })
}
