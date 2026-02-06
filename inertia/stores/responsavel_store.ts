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
  selectedStudentId: string | null
  isLoaded: boolean
  setStudents: (students: Student[]) => void
  setSelectedStudentId: (id: string | null) => void
  getStudentBySlug: (slug: string | null) => Student | undefined
  getStudentById: (id: string | null) => Student | undefined
  getSelectedStudent: () => Student | undefined
}

export const useResponsavelStore = create<ResponsavelState>((set, get) => ({
  students: [],
  selectedStudentId: null,
  isLoaded: false,

  setStudents: (students) => set({ students, isLoaded: true }),

  setSelectedStudentId: (id) => set({ selectedStudentId: id }),

  getStudentBySlug: (slug) => {
    const { students } = get()
    if (!slug) return students[0]
    return students.find((s) => s.slug === slug) || students[0]
  },

  getStudentById: (id) => {
    const { students } = get()
    if (!id) return students[0]
    return students.find((s) => s.id === id) || students[0]
  },

  getSelectedStudent: () => {
    const { students, selectedStudentId } = get()
    if (!selectedStudentId) return students[0]
    return students.find((s) => s.id === selectedStudentId) || students[0]
  },
}))
