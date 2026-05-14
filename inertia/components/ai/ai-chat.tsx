import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import { useRouter } from '@adonisjs/inertia/react'
import { AiChatPane } from './ai-chat-pane'
import { AiThreadList } from './ai-thread-list'
import type { SharedProps } from '../../lib/types'

type AiChatProps = {
  persona?: 'gestor' | 'comunicador'
  initialThreadId?: string | null
}

export function AiChat({ persona = 'gestor', initialThreadId = null }: AiChatProps) {
  const page = usePage<SharedProps>()
  const router = useRouter()
  const userName = page.props.user?.name ?? undefined

  // ChatGPT-style two-state routing:
  //  - `/escola/ia` (selectedId=null) is the draft state: empty chat pane,
  //    no row in the DB, no row in the sidebar. We still need a stable id
  //    to send to the server when the first message lands; `draftId` holds
  //    that locally without touching the URL.
  //  - `/escola/ia/conversa/:id` (selectedId set) is the persisted state.
  const [selectedId, setSelectedId] = useState<string | null>(initialThreadId)
  const [draftId, setDraftId] = useState<string>(() =>
    initialThreadId ? '' : crypto.randomUUID()
  )

  function handleNew() {
    setSelectedId(null)
    setDraftId(crypto.randomUUID())
    router.visit(
      { route: 'web.escola.ia.index' },
      { replace: true, preserveState: true, preserveScroll: true, only: [] }
    )
  }

  function handleSelect(id: string) {
    setSelectedId(id)
    router.visit(
      { route: 'web.escola.ia.conversa', routeParams: { threadId: id } },
      { replace: true, preserveState: true, preserveScroll: true, only: [] }
    )
  }

  function handlePersisted(id: string) {
    setSelectedId(id)
    router.visit(
      { route: 'web.escola.ia.conversa', routeParams: { threadId: id } },
      { replace: true, preserveState: true, preserveScroll: true, only: [] }
    )
  }

  const activeId = selectedId ?? draftId
  const isNewThread = selectedId === null

  return (
    <div className="flex h-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="w-[260px] shrink-0">
        <AiThreadList selectedId={selectedId} onSelect={handleSelect} onNew={handleNew} />
      </div>
      <div className="flex-1 min-w-0">
        <AiChatPane
          key={activeId}
          threadId={activeId}
          persona={persona}
          isNewThread={isNewThread}
          userName={userName}
          onPersisted={handlePersisted}
        />
      </div>
    </div>
  )
}
