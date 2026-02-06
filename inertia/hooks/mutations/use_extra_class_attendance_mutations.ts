import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CreateAttendancePayload {
  extraClassId: string
  date: string
  attendances: Array<{
    studentId: string
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED'
    justification?: string
  }>
}

interface UpdateAttendancePayload {
  extraClassId: string
  attendanceId: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED'
  justification?: string | null
}

export function useCreateExtraClassAttendance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ extraClassId, ...data }: CreateAttendancePayload) => {
      const res = await fetch(`/api/v1/extra-classes/${extraClassId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create attendance')
      return res.json()
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['extra-class-attendances', variables.extraClassId] })
      qc.invalidateQueries({
        queryKey: ['extra-class-attendance-summary', variables.extraClassId],
      })
    },
  })
}

export function useUpdateExtraClassAttendance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ extraClassId, attendanceId, ...data }: UpdateAttendancePayload) => {
      const res = await fetch(`/api/v1/extra-classes/${extraClassId}/attendance/${attendanceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update attendance')
      return res.json()
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['extra-class-attendances', variables.extraClassId] })
      qc.invalidateQueries({
        queryKey: ['extra-class-attendance-summary', variables.extraClassId],
      })
    },
  })
}
