import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useAssignResponsible() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      responsibleId,
      relationship,
    }: {
      studentId: string
      responsibleId: string
      relationship?: string
    }) => {
      return tuyau
        .$route('api.v1.responsibles.assign', { studentId })
        .$post({ responsibleId, relationship })
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
      studentId,
      responsibleId,
      relationship,
      isFinancialResponsible,
    }: {
      studentId: string
      responsibleId: string
      relationship?: string
      isFinancialResponsible?: boolean
    }) => {
      return tuyau
        .$route('api.v1.responsibles.updateAssignment', { studentId, responsibleId })
        .$put({ relationship, isFinancialResponsible })
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
    mutationFn: ({ studentId, responsibleId }: { studentId: string; responsibleId: string }) => {
      return tuyau
        .$route('api.v1.responsibles.remove', { studentId, responsibleId })
        .$delete({})
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-responsibles', variables.studentId] })
    },
  })
}
