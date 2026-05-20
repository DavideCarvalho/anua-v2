import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '~/lib/api'
import { useAuthUser } from '~/stores/auth_store'
import {
  buildContextualPrompts,
  formatContextLabel,
  type ContextualPromptHints,
  type FilterLabels,
  type TabFilterState,
} from '~/lib/contextual-prompts'

// Espelha `ChatScope['screen']` do backend (app/ai/chat_scope.ts). É um hint
// pra o system prompt do persona — segurança vem do chatScope, não daqui.
export type AskAnuaScreen = {
  id: string
  filters?: Record<string, string>
}

// Tudo que o AskAnuaPanel precisa pra render uma sessão contextual. Hooks
// específicos de cada tela montam esse objeto.
export type AskAnuaContext = {
  screen: AskAnuaScreen
  contextLabel: string
  suggestions: string[]
  // Namespace pra session-storage do threadId. Garante que sheets de telas
  // diferentes não compartilhem thread (contexto bleed). Inclui ids quando
  // a tela é "instanciada" (ex: turma específica) pra não misturar threads.
  storageNamespace: string
}

export function useDashboardAskAnuaContext(
  filters: TabFilterState,
  labels: FilterLabels
): AskAnuaContext {
  const user = useAuthUser()
  const schoolId = user?.school?.id ?? ''

  const screen = useMemo<AskAnuaScreen>(() => {
    const activeFilters: Record<string, string> = {}
    if (filters.academicPeriodId !== 'all') {
      activeFilters.academicPeriodId = filters.academicPeriodId
    }
    if (filters.subPeriodId !== 'all') activeFilters.subPeriodId = filters.subPeriodId
    if (filters.courseId !== 'all') activeFilters.courseId = filters.courseId
    if (filters.levelId !== 'all') activeFilters.levelId = filters.levelId
    if (filters.classId !== 'all') activeFilters.classId = filters.classId
    return {
      id: 'escola_dashboard',
      filters: Object.keys(activeFilters).length > 0 ? activeFilters : undefined,
    }
  }, [
    filters.academicPeriodId,
    filters.subPeriodId,
    filters.courseId,
    filters.levelId,
    filters.classId,
  ])

  // Mesma query key que o dashboard usa pros cards de alerta — useQuery
  // dedupe e a sheet pega o cache instantâneo se o dashboard já fetchou.
  const alertsQuery = {
    academicPeriodId: filters.academicPeriodId === 'all' ? undefined : filters.academicPeriodId,
    courseId: filters.courseId === 'all' ? undefined : filters.courseId,
    levelId: filters.levelId === 'all' ? undefined : filters.levelId,
    classId: filters.classId === 'all' ? undefined : filters.classId,
    subPeriodId: filters.subPeriodId === 'all' ? undefined : filters.subPeriodId,
  }
  const { data: alertsData } = useQuery({
    ...api.api.v1.dashboard.escolaPedagogicalAlerts.queryOptions({ query: alertsQuery }),
    enabled: Boolean(schoolId),
  })

  const promptHints = useMemo<ContextualPromptHints | undefined>(() => {
    const alerts = alertsData?.alerts
    if (!alerts) return undefined
    return {
      studentsAtRiskByGradeCount: alerts.studentsAtRiskByGrade?.count,
      studentsAtRiskByAttendanceCount: alerts.studentsAtRiskByAttendance?.count,
      teachersMissingAttendanceCount: alerts.teachersMissingAttendance?.count,
      examsWithoutGradesCount: alerts.examsWithoutGrades?.count,
      overdueActivitiesCount: alerts.overdueActivities?.count,
      ungradedSubmissionsCount: alerts.ungradedSubmissions?.count,
    }
  }, [alertsData])

  const suggestions = useMemo(
    () => buildContextualPrompts(filters, labels, promptHints),
    [filters, labels, promptHints]
  )

  const contextLabel = formatContextLabel(filters, labels)

  return {
    screen,
    contextLabel,
    suggestions,
    storageNamespace: 'escola_dashboard',
  }
}

// Helpers compartilhados pelo Panel — exportados pra que hooks/páginas que
// fazem prefetch do thread usem a mesma key sem duplicar formato.
export function askAnuaThreadKey(schoolId: string, namespace: string): string {
  return `anua:ask-sheet:thread:${schoolId}:${namespace}`
}

export function askAnuaFreshKey(schoolId: string, namespace: string): string {
  return `anua:ask-sheet:fresh:${schoolId}:${namespace}`
}
