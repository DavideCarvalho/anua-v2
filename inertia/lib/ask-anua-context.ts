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

// Telas dentro do dashboard de uma turma. Cada uma é uma tab no TurmaLayout.
// Manter sincronizado com o allowlist em app/validators/ai.ts e os labels em
// app/ai/personas.ts:SCREEN_LABELS — o backend rejeita ids fora desse conjunto.
export type TurmaScreenId =
  | 'escola_turma_atividades'
  | 'escola_turma_provas'
  | 'escola_turma_presencas'
  | 'escola_turma_notas'
  | 'escola_turma_situacao'

const TURMA_TAB_LABEL: Record<TurmaScreenId, string> = {
  escola_turma_atividades: 'Atividades',
  escola_turma_provas: 'Provas',
  escola_turma_presencas: 'Presenças',
  escola_turma_notas: 'Notas',
  escola_turma_situacao: 'Situação',
}

// Sugestões por tab. Linguagem de gestor (persona padrão hoje) — quando
// liberarmos pra professor/coordenador, separar por persona dentro do mesmo
// screenId. As tools que respondem essas perguntas já existem (queryDatabase
// + renderResult); o filtro de classId vem via screen.filters e o assistente
// usa como contexto implícito.
const TURMA_SUGGESTIONS: Record<TurmaScreenId, string[]> = {
  escola_turma_atividades: [
    'Quais atividades dessa turma estão atrasadas sem correção?',
    'Lista entregas dessa turma aguardando nota',
    'Quem tem mais atividades pendentes nessa turma?',
    'Quantas atividades cada disciplina tem nesse período?',
  ],
  escola_turma_provas: [
    'Provas dessa turma sem nota lançada',
    'Distribuição de notas da última prova',
    'Média da turma na prova mais recente',
    'Quais provas estão marcadas pra essa turma?',
  ],
  escola_turma_presencas: [
    'Quem faltou mais nessa turma esse mês?',
    'Frequência média da turma no período',
    'Alunos com mais de 25% de falta nessa turma',
    'Aulas dessa turma sem presença lançada',
  ],
  escola_turma_notas: [
    'Média da turma por disciplina',
    'Alunos abaixo da média nessa turma',
    'Quem está em risco de reprovação por nota?',
    'Como evoluíram as notas dessa turma esse ano?',
  ],
  escola_turma_situacao: [
    'Resumo de risco dos alunos dessa turma',
    'Quem precisa de atenção agora?',
    'Alunos em risco por nota e por frequência',
    'Quais disciplinas têm mais alunos em situação crítica?',
  ],
}

export function useTurmaAskAnuaContext(input: {
  screenId: TurmaScreenId
  classId: string
  courseId: string
  academicPeriodId: string
  className: string
}): AskAnuaContext {
  const { screenId, classId, courseId, academicPeriodId, className } = input
  return useMemo<AskAnuaContext>(
    () => ({
      screen: {
        id: screenId,
        filters: {
          classId,
          courseId,
          academicPeriodId,
        },
      },
      contextLabel: `${className} · ${TURMA_TAB_LABEL[screenId]}`,
      suggestions: TURMA_SUGGESTIONS[screenId],
      // Inclui classId no namespace — threads de turmas diferentes não
      // compartilham. Sem isso, abrir a sheet em Turma A e depois em Turma B
      // continuaria na mesma conversa com o contexto da A.
      storageNamespace: `${screenId}:${classId}`,
    }),
    [screenId, classId, courseId, academicPeriodId, className]
  )
}
