import type { QueryOptions } from '@tanstack/react-query'

export interface OccurrenceItem {
  id: string
  type: 'BEHAVIOR' | 'PERFORMANCE' | 'ABSENCE' | 'LATE' | 'PRAISE' | 'OTHER'
  text: string
  date: string
  createdAt: string
  student: {
    id: string
    name: string
  }
  class: {
    id: string
    name: string
  }
  teacherHasClassId: string
  teacher: {
    id: string
    name: string | null
  } | null
  subject: {
    id: string
    name: string | null
  } | null
  acknowledgedCount: number
  totalResponsibles: number
}

interface OccurrencesResponse {
  data: OccurrenceItem[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
  }
}

export type OccurrenceDetailResponse = OccurrenceItem

export interface OccurrenceTeacherClassItem {
  id: string
  teacher: { id: string; name: string }
  class: { id: string; name: string }
  subject: { id: string; name: string }
}

interface OccurrenceTeacherClassesResponse {
  data: OccurrenceTeacherClassItem[]
}

interface UseOccurrencesParams {
  page?: number
  limit?: number
  type?: 'BEHAVIOR' | 'PERFORMANCE' | 'ABSENCE' | 'LATE' | 'PRAISE' | 'OTHER'
  classId?: string
  academicPeriodId?: string
  studentId?: string
  teacherHasClassId?: string
  search?: string
  startDate?: string
  endDate?: string
  orderBy?: 'date' | 'student' | 'class' | 'type'
  direction?: 'asc' | 'desc'
}

export function useOccurrencesQueryOptions(params: UseOccurrencesParams = {}) {
  const {
    page = 1,
    limit = 20,
    type,
    classId,
    academicPeriodId,
    studentId,
    teacherHasClassId,
    search,
    startDate,
    endDate,
    orderBy,
    direction,
  } = params

  const queryParams = new URLSearchParams()
  queryParams.set('page', String(page))
  queryParams.set('limit', String(limit))
  if (type) queryParams.set('type', type)
  if (classId) queryParams.set('classId', classId)
  if (academicPeriodId) queryParams.set('academicPeriodId', academicPeriodId)
  if (studentId) queryParams.set('studentId', studentId)
  if (teacherHasClassId) queryParams.set('teacherHasClassId', teacherHasClassId)
  if (search) queryParams.set('search', search)
  if (startDate) queryParams.set('startDate', startDate)
  if (endDate) queryParams.set('endDate', endDate)
  if (orderBy) queryParams.set('orderBy', orderBy)
  if (direction) queryParams.set('direction', direction)

  return {
    queryKey: [
      'occurrences',
      {
        page,
        limit,
        type,
        classId,
        academicPeriodId,
        studentId,
        teacherHasClassId,
        search,
        startDate,
        endDate,
        orderBy,
        direction,
      },
    ],
    queryFn: async (): Promise<OccurrencesResponse> => {
      const response = await fetch(`/api/v1/occurrences?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar registros diarios')
      }
      return response.json()
    },
  } satisfies QueryOptions<OccurrencesResponse>
}

export function useOccurrenceTeacherClassesQueryOptions(params?: { academicPeriodId?: string }) {
  const queryParams = new URLSearchParams()
  if (params?.academicPeriodId) {
    queryParams.set('academicPeriodId', params.academicPeriodId)
  }

  return {
    queryKey: ['occurrence-teacher-classes', params?.academicPeriodId ?? null],
    queryFn: async (): Promise<OccurrenceTeacherClassesResponse> => {
      const response = await fetch(
        `/api/v1/occurrences/teacher-classes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      )
      if (!response.ok) {
        throw new Error('Erro ao buscar turmas e materias para registros diarios')
      }
      return response.json()
    },
  } satisfies QueryOptions<OccurrenceTeacherClassesResponse>
}

export function useOccurrenceDetailQueryOptions(occurrenceId: string | null) {
  return {
    queryKey: ['occurrence', occurrenceId],
    queryFn: async (): Promise<OccurrenceDetailResponse> => {
      const response = await fetch(`/api/v1/occurrences/${occurrenceId}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar detalhes do registro diario')
      }
      return response.json()
    },
    enabled: Boolean(occurrenceId),
  }
}
