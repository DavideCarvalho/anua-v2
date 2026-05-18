import { useEffect, useMemo, useState } from 'react'
import { Plus, Sparkles, X } from 'lucide-react'
import { Sheet, SheetContent } from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import { AiChatPane } from '~/components/ai/ai-chat-pane'
import { useAuthUser } from '~/stores/auth_store'
import { useIsMobile } from '~/hooks/use_mobile'
import {
  buildContextualPrompts,
  formatContextLabel,
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

  const suggestions = useMemo(
    () => buildContextualPrompts(filters, labels),
    [filters, labels]
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
