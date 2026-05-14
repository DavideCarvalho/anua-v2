import { Head } from '@inertiajs/react'
import { AiChat } from '../../components/ai/ai-chat'
import { EscolaLayout } from '../../components/layouts'

type EscolaIaPageProps = {
  initialThreadId: string | null
}

export default function EscolaIaPage({ initialThreadId }: EscolaIaPageProps) {
  return (
    <EscolaLayout>
      <Head title="Assistente IA" />

      <AiChat initialThreadId={initialThreadId} />
    </EscolaLayout>
  )
}
