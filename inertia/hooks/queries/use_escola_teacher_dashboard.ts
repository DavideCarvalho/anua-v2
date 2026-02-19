import { tuyau } from '../../lib/api'

const $route = tuyau.api.v1.escola.teacherDashboard.$get

export type TeacherDashboardResponse = {
  stats: {
    classesCount: number
    studentsCount: number
    pendingGradesCount: number
    classesWithoutRecentAttendance: number
    atRiskStudentsCount: number
  }
  alerts: Array<{
    id: string
    priority: 'high' | 'medium'
    title: string
    description: string
    href: string
  }>
  classes: Array<{
    id: string
    name: string
    slug: string
  }>
}

export function useEscolaTeacherDashboardQueryOptions() {
  return {
    queryKey: ['escola', 'teacher-dashboard'],
    queryFn: async () => {
      const response = await $route()
      if (response.error) {
        throw new Error((response.error as any).value?.message || 'Erro ao carregar dashboard')
      }
      return response.data as TeacherDashboardResponse
    },
    refetchInterval: 5 * 60 * 1000,
  }
}
