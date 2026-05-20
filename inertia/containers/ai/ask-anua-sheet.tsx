import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { useMutation } from '@tanstack/react-query'
import { Bookmark, Plus, Sparkles, X } from 'lucide-react'
import { Sheet, SheetContent } from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import { AiChatPane } from '~/components/ai/ai-chat-pane'
import { useAuthUser } from '~/stores/auth_store'
import { useIsMobile } from '~/hooks/use_mobile'
import { api } from '~/lib/api'
import {
  askAnuaFreshKey,
  askAnuaThreadKey,
  type AskAnuaScreen,
} from '~/lib/ask-anua-context'

type AskAnuaPanelProps = {
  screen: AskAnuaScreen
  contextLabel: string
  suggestions: string[]
  storageNamespace: string
  onClose: () => void
}

type AskAnuaSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  screen: AskAnuaScreen
  contextLabel: string
  suggestions: string[]
  storageNamespace: string
}

function readStoredThread(
  schoolId: string,
  namespace: string
): { id: string; fresh: boolean } | null {
  if (typeof window === 'undefined' || !schoolId) return null
  const stored = window.sessionStorage.getItem(askAnuaThreadKey(schoolId, namespace))
  if (!stored) return null
  const fresh = window.sessionStorage.getItem(askAnuaFreshKey(schoolId, namespace)) !== 'false'
  return { id: stored, fresh }
}

function createAndStoreThread(schoolId: string, namespace: string): string {
  const id = crypto.randomUUID()
  if (typeof window !== 'undefined' && schoolId) {
    window.sessionStorage.setItem(askAnuaThreadKey(schoolId, namespace), id)
    window.sessionStorage.setItem(askAnuaFreshKey(schoolId, namespace), 'true')
  }
  return id
}

/**
 * Conteúdo puro do "Perguntar ao Anuá" — header + AiChatPane.
 * Use direto (inline) em desktop, ou envelopado em <AskAnuaSheet/> em mobile.
 *
 * Recebe screen/suggestions/contextLabel já prontos — quem chama monta isso
 * via hook específico da tela (ex: useDashboardAskAnuaContext,
 * useTurmaAskAnuaContext). Isso mantém o Panel screen-agnostic.
 */
export function AskAnuaPanel({
  screen,
  contextLabel,
  suggestions,
  storageNamespace,
  onClose,
}: AskAnuaPanelProps) {
  const user = useAuthUser()
  // schoolId vem do Inertia shared user — em rotas /responsavel o objeto
  // aninhado `school` não é hidratado, mas a coluna raw `schoolId` está
  // sempre presente. Sem isso o effect que cria a thread fica bailando e o
  // AiChatPane nunca monta.
  const schoolId = user?.schoolId ?? ''

  // null até o effect rodar no client; AiChatPane só renderiza quando tem id.
  // Isso evita gerar UUIDs descartáveis no SSR e elimina a hydration mismatch.
  const [threadId, setThreadId] = useState<string | null>(null)
  const [isFresh, setIsFresh] = useState<boolean>(true)

  // Trocar de escola OU de tela regenera escopo — threadId antigo seguia preso
  // ao schoolId/namespace errado. Toda escrita em sessionStorage fica confinada
  // a este effect e handlers.
  useEffect(() => {
    if (!schoolId) return
    const stored = readStoredThread(schoolId, storageNamespace)
    if (stored) {
      setThreadId(stored.id)
      setIsFresh(stored.fresh)
      return
    }
    const id = createAndStoreThread(schoolId, storageNamespace)
    setThreadId(id)
    setIsFresh(true)
  }, [schoolId, storageNamespace])

  function handleNewConversation() {
    if (!schoolId) return
    const id = createAndStoreThread(schoolId, storageNamespace)
    setThreadId(id)
    setIsFresh(true)
  }

  function handlePersisted() {
    if (typeof window === 'undefined' || !schoolId) return
    window.sessionStorage.setItem(askAnuaFreshKey(schoolId, storageNamespace), 'false')
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
      window.sessionStorage.removeItem(askAnuaThreadKey(schoolId, storageNamespace))
      window.sessionStorage.removeItem(askAnuaFreshKey(schoolId, storageNamespace))
    }
    onClose()
    router.visit(`/escola/ia/conversa/${threadId}`)
  }

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

export function AskAnuaSheet({
  open,
  onOpenChange,
  screen,
  contextLabel,
  suggestions,
  storageNamespace,
}: AskAnuaSheetProps) {
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
        <AskAnuaPanel
          screen={screen}
          contextLabel={contextLabel}
          suggestions={suggestions}
          storageNamespace={storageNamespace}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}
