import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CreateExtraClassPayload {
  name: string
  description?: string
  schoolId: string
  academicPeriodId: string
  contractId: string
  teacherId: string
  maxStudents?: number
  schedules: Array<{ weekDay: number; startTime: string; endTime: string }>
}

interface UpdateExtraClassPayload {
  id: string
  name?: string
  description?: string | null
  contractId?: string
  teacherId?: string
  maxStudents?: number | null
  isActive?: boolean
  schedules?: Array<{ weekDay: number; startTime: string; endTime: string }>
}

interface EnrollStudentPayload {
  extraClassId: string
  studentId: string
  contractId?: string
  scholarshipId?: string | null
  paymentMethod: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
  paymentDay: number
}

interface CancelEnrollmentPayload {
  extraClassId: string
  enrollmentId: string
}

export function useCreateExtraClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateExtraClassPayload) => {
      const res = await fetch('/api/v1/extra-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create extra class')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extra-classes'] })
    },
  })
}

export function useUpdateExtraClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateExtraClassPayload) => {
      const res = await fetch(`/api/v1/extra-classes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update extra class')
      return res.json()
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['extra-classes'] })
      qc.invalidateQueries({ queryKey: ['extra-class', variables.id] })
    },
  })
}

export function useDeleteExtraClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/extra-classes/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to delete extra class')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extra-classes'] })
    },
  })
}

export function useEnrollStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ extraClassId, ...data }: EnrollStudentPayload) => {
      const res = await fetch(`/api/v1/extra-classes/${extraClassId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to enroll student')
      return res.json()
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['extra-class-students', variables.extraClassId] })
      qc.invalidateQueries({ queryKey: ['extra-classes'] })
      qc.invalidateQueries({ queryKey: ['extra-class', variables.extraClassId] })
    },
  })
}

export function useCancelEnrollment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ extraClassId, enrollmentId }: CancelEnrollmentPayload) => {
      const res = await fetch(`/api/v1/extra-classes/${extraClassId}/enroll/${enrollmentId}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to cancel enrollment')
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['extra-class-students', variables.extraClassId] })
      qc.invalidateQueries({ queryKey: ['extra-classes'] })
      qc.invalidateQueries({ queryKey: ['extra-class', variables.extraClassId] })
    },
  })
}
