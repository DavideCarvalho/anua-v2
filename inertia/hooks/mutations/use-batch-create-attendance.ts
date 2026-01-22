import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface AttendanceRecord {
  studentId: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED'
  justification?: string
}

interface BatchCreateAttendanceData {
  classId: string
  academicPeriodId: string
  subjectId: string
  date: string
  attendances: AttendanceRecord[]
}

export function useBatchCreateAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BatchCreateAttendanceData) => {
      return tuyau.$route('api.v1.attendance.batch').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })
}
