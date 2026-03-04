import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ArrowLeft } from 'lucide-react'

import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { IdleClickArea } from '../../components/idle/idle-click-area'
import { IdleHud } from '../../components/idle/idle-hud'
import { IdleUpgrades } from '../../components/idle/idle-upgrades'
import { useIdleGame } from '../../lib/idle/use-idle-game'

interface AlunoIdlePageProps {
  studentName: string
}

export default function AlunoIdlePage({ studentName }: AlunoIdlePageProps) {
  const { state, actions, clickPulse } = useIdleGame()

  return (
    <AlunoLayout>
      <Head title="Idle" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm text-muted-foreground">Modo idle</p>
            <h1 className="text-2xl font-bold">Oficina do {studentName}</h1>
          </div>
          <Link
            href="/aluno"
            className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </div>

        <IdleHud state={state} />

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <IdleClickArea state={state} onClick={actions.onClick} clickPulse={clickPulse} />
          <IdleUpgrades state={state} canBuy={actions.canBuy} onBuy={actions.onBuyUpgrade} />
        </div>
      </div>
    </AlunoLayout>
  )
}
