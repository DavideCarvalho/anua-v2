import { Coins, Sword, Gauge, Skull } from 'lucide-react'

import { formatIdleNumber, getTotalDps, type IdleState } from '../../lib/idle/idle-core'

interface IdleHudProps {
  state: IdleState
}

export function IdleHud({ state }: IdleHudProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <div className="rounded-xl border bg-card p-3">
        <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Coins className="size-3" />
          Ouro
        </p>
        <p className="text-2xl font-bold">{formatIdleNumber(state.gold)}</p>
      </div>
      <div className="rounded-xl border bg-card p-3">
        <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Gauge className="size-3" />
          DPS
        </p>
        <p className="text-2xl font-bold">{getTotalDps(state).toFixed(1)}</p>
      </div>
      <div className="rounded-xl border bg-card p-3">
        <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Sword className="size-3" />
          Clique
        </p>
        <p className="text-2xl font-bold">{state.clickDamage.toFixed(0)}</p>
      </div>
      <div className="rounded-xl border bg-card p-3">
        <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Skull className="size-3" />
          Kills
        </p>
        <p className="text-2xl font-bold">{formatIdleNumber(state.kills)}</p>
      </div>
    </div>
  )
}
