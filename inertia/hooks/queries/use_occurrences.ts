import type { QueryOptions } from '@tanstack/react-query'

export interface OccurrenceItem {
  id: string
  type: 'BEHAVIOR' | 'PERFORMANCE' | 'ABSENCE' | 'LATE' | 'OTHER'
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
  type?: 'BEHAVIOR' | 'PERFORMANCE' | 'ABSENCE' | 'LATE' | 'OTHER'
  classId?: string
  studentId?: string
  teacherHasClassId?: string
  search?: string
  startDate?: string
  endDate?: string
}

export function useOccurrencesQueryOptions(params: UseOccurrencesParams = {}) {
  const {
    page = 1,
    limit = 20,
    type,
    classId,
    studentId,
    teacherHasClassId,
    search,
    startDate,
    endDate,
  } = params

  const queryParams = new URLSearchParams()
  queryParams.set('page', String(page))
  queryParams.set('limit', String(limit))
  if (type) queryParams.set('type', type)
  if (classId) queryParams.set('classId', classId)
  if (studentId) queryParams.set('studentId', studentId)
  if (teacherHasClassId) queryParams.set('teacherHasClassId', teacherHasClassId)
  if (search) queryParams.set('search', search)
  if (startDate) queryParams.set('startDate', startDate)
  if (endDate) queryParams.set('endDate', endDate)

  return {
    queryKey: [
      'occurrences',
      { page, limit, type, classId, studentId, teacherHasClassId, search, startDate, endDate },
    ],
    queryFn: async (): Promise<OccurrencesResponse> => {
      const response = await fetch(`/api/v1/occurrences?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar ocorrencias')
      }
      return response.json()
    },
  } satisfies QueryOptions<OccurrencesResponse>
}

export function useOccurrenceTeacherClassesQueryOptions() {
  return {
    queryKey: ['occurrence-teacher-classes'],
    queryFn: async (): Promise<OccurrenceTeacherClassesResponse> => {
      const response = await fetch('/api/v1/occurrences/teacher-classes')
      if (!response.ok) {
        throw new Error('Erro ao buscar turmas e materias para ocorrencias')
      }
      return response.json()
    },
  } satisfies QueryOptions<OccurrenceTeacherClassesResponse>
}
