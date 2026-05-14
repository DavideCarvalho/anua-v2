import { Head } from '@inertiajs/react'
import { AiChat } from '../../components/ai/ai-chat'
import type { ChatPersonaRole } from '../../components/ai/ai-chat-empty'
import { EscolaLayout } from '../../components/layouts'

type EscolaIaPageProps = {
  initialThreadId: string | null
  persona: ChatPersonaRole | null
}

export default function EscolaIaPage({ initialThreadId, persona }: EscolaIaPageProps) {
  return (
    <EscolaLayout>
      <Head title="Assistente IA" />

      <AiChat initialThreadId={initialThreadId} persona={persona} />
    </EscolaLayout>
  )
}
