import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useAssignTeacherToClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ teacherId, classId }: { teacherId: string; classId: string }) => {
      return tuyau
        .$route('api.v1.teachers.assignClass', { id: teacherId })
        .$post({ classId })
        .unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-classes', variables.teacherId] })
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
    },
  })
}

export function useRemoveTeacherFromClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ teacherId, classId }: { teacherId: string; classId: string }) => {
      return tuyau
        .$route('api.v1.teachers.removeClass', { id: teacherId, classId })
        .$delete({})
        .unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-classes', variables.teacherId] })
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
    },
  })
}

export function useApproveTeacherAbsence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (absenceId: string) => {
      return tuyau
        .$route('api.v1.teachers.approveAbsence')
        .$patch({ absenceId })
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-absences'] })
    },
  })
}

export function useRejectTeacherAbsence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ absenceId, reason }: { absenceId: string; reason?: string }) => {
      return tuyau
        .$route('api.v1.teachers.rejectAbsence')
        .$patch({ absenceId, reason })
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-absences'] })
    },
  })
}
