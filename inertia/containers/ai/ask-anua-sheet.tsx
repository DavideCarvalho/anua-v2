import { useEffect, useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Bookmark, Plus, Sparkles, X } from 'lucide-react'
import { Sheet, SheetContent } from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import { AiChatPane } from '~/components/ai/ai-chat-pane'
import { useAuthUser } from '~/stores/auth_store'
import { useIsMobile } from '~/hooks/use_mobile'
import { api } from '~/lib/api'
import {
  buildContextualPrompts,
  formatContextLabel,
  type ContextualPromptHints,
  type FilterLabels,
  type TabFilterState,
} from '~/lib/contextual-prompts'

type AskAnuaPanelProps = {
  filters: TabFilterState
  labels: FilterLabels
  onClose: () => void
}

type AskAnuaSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: TabFilterState
  labels: FilterLabels
}

function threadKey(schoolId: string): string {
  return `anua:ask-sheet:thread:${schoolId}`
}

function freshKey(schoolId: string): string {
  return `anua:ask-sheet:fresh:${schoolId}`
}

function readStoredThread(schoolId: string): { id: string; fresh: boolean } | null {
  if (typeof window === 'undefined' || !schoolId) return null
  const stored = window.sessionStorage.getItem(threadKey(schoolId))
  if (!stored) return null
  const fresh = window.sessionStorage.getItem(freshKey(schoolId)) !== 'false'
  return { id: stored, fresh }
}

function createAndStoreThread(schoolId: string): string {
  const id = crypto.randomUUID()
  if (typeof window !== 'undefined' && schoolId) {
    window.sessionStorage.setItem(threadKey(schoolId), id)
    window.sessionStorage.setItem(freshKey(schoolId), 'true')
  }
  return id
}

/**
 * Conteúdo puro do "Perguntar ao Anuá" — header + AiChatPane.
 * Use direto (inline) em desktop, ou envelopado em <AskAnuaSheet/> em mobile.
 */
export function AskAnuaPanel({ filters, labels, onClose }: AskAnuaPanelProps) {
  const user = useAuthUser()
  const schoolId = user?.school?.id ?? ''

  // null até o effect rodar no client; AiChatPane só renderiza quando tem id.
  // Isso evita gerar UUIDs descartáveis no SSR e elimina a hydration mismatch.
  const [threadId, setThreadId] = useState<string | null>(null)
  const [isFresh, setIsFresh] = useState<boolean>(true)

  // Trocar de escola regenera escopo — threadId antigo seguia preso ao
  // schoolId errado e o backend rejeitaria querying na escola nova.
  // Toda escrita em sessionStorage fica confinada a este effect e handlers.
  useEffect(() => {
    if (!schoolId) return
    const stored = readStoredThread(schoolId)
    if (stored) {
      setThreadId(stored.id)
      setIsFresh(stored.fresh)
      return
    }
    const id = createAndStoreThread(schoolId)
    setThreadId(id)
    setIsFresh(true)
  }, [schoolId])

  function handleNewConversation() {
    if (!schoolId) return
    const id = createAndStoreThread(schoolId)
    setThreadId(id)
    setIsFresh(true)
  }

  function handlePersisted() {
    if (typeof window === 'undefined' || !schoolId) return
    window.sessionStorage.setItem(freshKey(schoolId), 'false')
    setIsFresh(false)
  }

  // Promove a thread (surface='sheet' → 'page'), descarta o threadId do
  // sessionStorage pra que abrir a sheet de novo gere uma conversa fresca,
  // e navega pra página de chat fullscreen. O canPromote gate evita
  // promover threads vazias.
  const promoteMutation = useMutation(api.api.v1.ai.threads.promote.mutationOptions())
  const canPromote = Boolean(threadId) && !isFresh && !promoteMutation.isPending
  async function handlePromote() {
    if (!threadId || !schoolId || isFresh) return
    await promoteMutation.mutateAsync({ params: { id: threadId } })
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(threadKey(schoolId))
      window.sessionStorage.removeItem(freshKey(schoolId))
    }
    onClose()
    router.visit(`/escola/ia/conversa/${threadId}`)
  }

  const screen = useMemo(() => {
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
  // Sem dados, suggestions caem no fallback estático.
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

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-foreground">Perguntar ao Anuá</h2>
            <p className="truncate text-xs text-muted-foreground">{contextLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {canPromote && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handlePromote}
              aria-label="Salvar como conversa"
              title="Salvar como conversa"
              disabled={promoteMutation.isPending}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleNewConversation}
            aria-label="Nova conversa"
            title="Nova conversa"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {threadId && (
          <AiChatPane
            key={threadId}
            threadId={threadId}
            persona="gestor"
            isNewThread={isFresh}
            hideHeader
            screen={screen}
            surface="sheet"
            suggestions={suggestions}
            userName={user?.name ?? undefined}
            onPersisted={handlePersisted}
          />
        )}
      </div>
    </div>
  )
}

export function AskAnuaSheet({ open, onOpenChange, filters, labels }: AskAnuaSheetProps) {
  const isMobile = useIsMobile()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={
          isMobile
            ? 'h-[90vh] w-full p-0'
            : 'w-full p-0 sm:max-w-[560px]'
        }
        showCloseButton={false}
      >
        <AskAnuaPanel filters={filters} labels={labels} onClose={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}
