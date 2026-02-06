import type { QueryOptions } from '@tanstack/react-query'

interface StudentAttendanceRecord {
  id: string
  studentId: string
  extraClassAttendanceId: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED'
  justification: string | null
  student?: { id: string; userId: string; user?: { id: string; name: string } }
}

interface ExtraClassAttendance {
  id: string
  extraClassId: string
  extraClassScheduleId: string
  date: string
  note: string | null
  studentAttendances?: StudentAttendanceRecord[]
}

interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
}

interface ExtraClassAttendancesResponse {
  data: ExtraClassAttendance[]
  meta: PaginationMeta
}

interface AttendanceSummaryStudent {
  studentId: string
  studentName: string
  totalClasses: number
  presentCount: number
  absentCount: number
  lateCount: number
  justifiedCount: number
  attendancePercentage: number
}

interface AttendanceSummaryResponse {
  data: AttendanceSummaryStudent[]
}

export type {
  ExtraClassAttendance,
  StudentAttendanceRecord,
  ExtraClassAttendancesResponse,
  AttendanceSummaryStudent,
  AttendanceSummaryResponse,
}

export function useExtraClassAttendancesQueryOptions(
  extraClassId: string,
  params: { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 20 } = params
  return {
    queryKey: ['extra-class-attendances', extraClassId, { page, limit }],
    queryFn: async (): Promise<ExtraClassAttendancesResponse> => {
      const res = await fetch(
        `/api/v1/extra-classes/${extraClassId}/attendance?page=${page}&limit=${limit}`
      )
      if (!res.ok) throw new Error('Failed to fetch attendances')
      return res.json()
    },
  } satisfies QueryOptions
}

export function useExtraClassAttendanceSummaryQueryOptions(extraClassId: string) {
  return {
    queryKey: ['extra-class-attendance-summary', extraClassId],
    queryFn: async (): Promise<AttendanceSummaryResponse> => {
      const res = await fetch(`/api/v1/extra-classes/${extraClassId}/attendance/summary`)
      if (!res.ok) throw new Error('Failed to fetch attendance summary')
      return res.json()
    },
  } satisfies QueryOptions
}
