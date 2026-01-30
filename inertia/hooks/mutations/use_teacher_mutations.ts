import { tuyau } from '../../lib/api'

export function useUpdateTeacherMutationOptions() {
  return {
    mutationFn: ({
      id,
      ...data
    }: {
      id: string
      name?: string
      email?: string
      hourlyRate?: number
      active?: boolean
    }) => {
      return tuyau.$route('api.v1.teachers.updateTeacher', { id }).$put(data).unwrap()
    },
  }
}

export function useAssignTeacherToClassMutationOptions() {
  return {
    mutationFn: ({ teacherId, classId }: { teacherId: string; classId: string }) => {
      return tuyau
        .$route('api.v1.teachers.assignClass', { id: teacherId })
        .$post({ classId } as any)
        .unwrap()
    },
  }
}

export function useRemoveTeacherFromClassMutationOptions() {
  return {
    mutationFn: ({ teacherId, classId }: { teacherId: string; classId: string }) => {
      return tuyau
        .$route('api.v1.teachers.removeClass', { id: teacherId, classId })
        .$delete({})
        .unwrap()
    },
  }
}

export function useApproveTeacherAbsenceMutationOptions() {
  return {
    mutationFn: (absenceId: string) => {
      return tuyau.$route('api.v1.teachers.approveAbsence').$patch({ absenceId }).unwrap()
    },
  }
}

export function useRejectTeacherAbsenceMutationOptions() {
  return {
    mutationFn: ({
      absenceId,
      rejectionReason,
    }: {
      absenceId: string
      rejectionReason: string
    }) => {
      return tuyau
        .$route('api.v1.teachers.rejectAbsence')
        .$patch({ absenceId, rejectionReason })
        .unwrap()
    },
  }
}
