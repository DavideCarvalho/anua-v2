import { Head } from '@inertiajs/react'
import { AiChat } from '../../components/ai/ai-chat'
import { EscolaLayout } from '../../components/layouts'

export default function EscolaIaPage() {
  return (
    <EscolaLayout>
      <Head title="Assistente IA" />

      <AiChat />
    </EscolaLayout>
  )
}
