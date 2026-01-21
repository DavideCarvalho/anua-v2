import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.insurance.resetSchool')

export function useResetSchoolInsuranceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (schoolId: string) => {
      return $route.$post({ params: { schoolId } }).unwrap()
    },
    onSuccess: (_data, schoolId) => {
      queryClient.invalidateQueries({ queryKey: ['insurance', 'config', schoolId] })
      queryClient.invalidateQueries({ queryKey: ['schools'] })
    },
  })
}
