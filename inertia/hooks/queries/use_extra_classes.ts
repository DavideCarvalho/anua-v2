import type { QueryOptions } from '@tanstack/react-query'

interface ExtraClassSchedule {
  id: string
  extraClassId: string
  weekDay: number
  startTime: string
  endTime: string
}

interface ExtraClass {
  id: string
  name: string
  slug: string
  description: string | null
  schoolId: string
  academicPeriodId: string
  contractId: string
  teacherId: string
  maxStudents: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  schedules: ExtraClassSchedule[]
  teacher?: { id: string; userId: string; user?: { id: string; name: string } }
  contract?: {
    id: string
    name: string
    ammount: number
    paymentType: string
    installments: number
  }
  academicPeriod?: { id: string; name: string }
  enrollmentCount: number
}

interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
}

interface ExtraClassesResponse {
  data: ExtraClass[]
  meta: PaginationMeta
}

interface UseExtraClassesParams {
  page?: number
  limit?: number
  schoolId?: string
  academicPeriodId?: string
  isActive?: boolean
  search?: string
}

export type { ExtraClass, ExtraClassSchedule, ExtraClassesResponse }

export function useExtraClassesQueryOptions(params: UseExtraClassesParams = {}) {
  const { page = 1, limit = 20, schoolId, academicPeriodId, isActive, search } = params
  const queryParams = new URLSearchParams()
  queryParams.set('page', String(page))
  queryParams.set('limit', String(limit))
  if (schoolId) queryParams.set('schoolId', schoolId)
  if (academicPeriodId) queryParams.set('academicPeriodId', academicPeriodId)
  if (isActive !== undefined) queryParams.set('isActive', String(isActive))
  if (search) queryParams.set('search', search)

  return {
    queryKey: ['extra-classes', { page, limit, schoolId, academicPeriodId, isActive, search }],
    queryFn: async (): Promise<ExtraClassesResponse> => {
      const res = await fetch(`/api/v1/extra-classes?${queryParams}`)
      if (!res.ok) throw new Error('Failed to fetch extra classes')
      return res.json()
    },
  } satisfies QueryOptions
}

export function useExtraClassQueryOptions(id: string) {
  return {
    queryKey: ['extra-class', id],
    queryFn: async (): Promise<ExtraClass> => {
      const res = await fetch(`/api/v1/extra-classes/${id}`)
      if (!res.ok) throw new Error('Failed to fetch extra class')
      return res.json()
    },
  } satisfies QueryOptions
}

interface ExtraClassStudent {
  id: string
  studentId: string
  extraClassId: string
  contractId: string
  scholarshipId: string | null
  paymentMethod: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
  paymentDay: number
  enrolledAt: string
  cancelledAt: string | null
  student?: { id: string; userId: string; user?: { id: string; name: string } }
}

interface ExtraClassStudentsResponse {
  data: ExtraClassStudent[]
  meta: PaginationMeta
}

export type { ExtraClassStudent, ExtraClassStudentsResponse }

export function useExtraClassStudentsQueryOptions(
  extraClassId: string,
  params: { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 20 } = params
  return {
    queryKey: ['extra-class-students', extraClassId, { page, limit }],
    queryFn: async (): Promise<ExtraClassStudentsResponse> => {
      const res = await fetch(
        `/api/v1/extra-classes/${extraClassId}/students?page=${page}&limit=${limit}`
      )
      if (!res.ok) throw new Error('Failed to fetch extra class students')
      return res.json()
    },
  } satisfies QueryOptions
}
