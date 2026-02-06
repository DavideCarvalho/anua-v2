import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useValidateScheduleConflict() {
  return useMutation({
    mutationFn: (data: {
      teacherHasClassId: string
      classWeekDay: number
      startTime: string
      endTime: string
      academicPeriodId: string
      classId: string
    }) => {
      return tuyau
        .$route('api.v1.schedules.validateConflict')
        .$post(data as any)
        .unwrap()
    },
  })
}

export function useSaveClassSchedule() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      classId,
      ...data
    }: {
      classId: string
      academicPeriodId: string
      slots: Array<{
        teacherHasClassId: string | null
        classWeekDay: number
        startTime: string
        endTime: string
      }>
    }) => {
      return tuyau
        .$route('api.v1.schedules.saveClassSchedule', { classId })
        .$post(data as any)
        .unwrap()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classSchedule'] })
    },
  })
}

export function useGenerateClassSchedule() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      classId,
      ...data
    }: {
      classId: string
      academicPeriodId: string
      config: {
        startTime: string
        classesPerDay: number
        classDuration: number
        breakAfterClass: number
        breakDuration: number
      }
    }) => {
      return tuyau
        .$route('api.v1.schedules.generateClassSchedule', { classId })
        .$post(data as any)
        .unwrap()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classSchedule'] })
    },
  })
}
