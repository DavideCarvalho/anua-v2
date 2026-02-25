import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type UpdateSchoolInsuranceData = {
  schoolId: string
  hasInsurance?: boolean
  insurancePercentage?: number
  insuranceCoveragePercentage?: number
  insuranceClaimWaitingDays?: number
}

export function useUpdateSchoolInsuranceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSchoolInsuranceData) => {
      const { schoolId, ...rest } = data
      return tuyau
        .$route('api.v1.insurance.updateSchool', { schoolId })
        .$put({ schoolId, ...rest })
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['insurance', 'config', variables.schoolId] })
      queryClient.invalidateQueries({ queryKey: ['schools'] })
    },
  })
}
