import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useAssignResponsible() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      responsibleId,
      isPedagogical,
      isFinancial,
    }: {
      studentId: string
      responsibleId: string
      isPedagogical?: boolean
      isFinancial?: boolean
    }) => {
      return tuyau
        .$route('api.v1.responsibles.assign')
        .$post({ studentId, responsibleId, isPedagogical, isFinancial })
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-responsibles', variables.studentId] })
    },
  })
}

export function useUpdateResponsibleAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      responsibleId,
      isPedagogical,
      isFinancial,
    }: {
      studentId: string
      responsibleId: string
      isPedagogical?: boolean
      isFinancial?: boolean
    }) => {
      return tuyau
        .$route('api.v1.responsibles.updateAssignment', { id: responsibleId })
        .$patch({ isPedagogical, isFinancial })
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-responsibles', variables.studentId] })
    },
  })
}

export function useRemoveResponsible() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ responsibleId }: { studentId: string; responsibleId: string }) => {
      return tuyau.$route('api.v1.responsibles.remove', { id: responsibleId }).$delete({}).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-responsibles', variables.studentId] })
    },
  })
}
