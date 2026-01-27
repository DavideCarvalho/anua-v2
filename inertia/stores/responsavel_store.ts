import { create } from 'zustand'

export interface Student {
  id: string
  slug: string
  name: string
  className: string
  levelName?: string
  averageGrade: number | null
  attendanceRate: number | null
  pendingPayments: number
  points: number
  permissions: {
    pedagogical: boolean
    financial: boolean
  }
}

interface ResponsavelState {
  students: Student[]
  isLoaded: boolean
  setStudents: (students: Student[]) => void
  getStudentBySlug: (slug: string | null) => Student | undefined
}

export const useResponsavelStore = create<ResponsavelState>((set, get) => ({
  students: [],
  isLoaded: false,

  setStudents: (students) => set({ students, isLoaded: true }),

  getStudentBySlug: (slug) => {
    const { students } = get()
    if (!slug) return students[0]
    return students.find((s) => s.slug === slug) || students[0]
  },
}))
