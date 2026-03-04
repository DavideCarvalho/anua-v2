import {
  formatIdleNumber,
  type IdleState,
  getIdleCharacterAnimation,
} from '../../lib/idle/idle-core'
import { useEffect, useState } from 'react'

interface IdleClickAreaProps {
  state: IdleState
  onClick: () => void
  clickPulse: number
}

export function IdleClickArea({ state, onClick, clickPulse }: IdleClickAreaProps) {
  const animation = getIdleCharacterAnimation(state)
  const hpPct = Math.max(0, Math.min(100, (state.monster.hp / state.monster.maxHp) * 100))
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (clickPulse <= 0) return
    setFlash(true)
    const t = window.setTimeout(() => setFlash(false), 110)
    return () => window.clearTimeout(t)
  }, [clickPulse])

  return (
    <div className="rounded-2xl border bg-card p-6 text-center">
      <p className="mb-2 text-sm text-muted-foreground">
        Seu heroi ataca automaticamente. Clique para dano extra.
      </p>
      <div className="mb-2 flex justify-center gap-8">
        <div
          className={`idle-character-sprite idle-character-sprite--${animation}`}
          aria-hidden="true"
        />
        <div
          className={`idle-monster-sprite ${flash ? 'idle-monster-sprite--hit' : ''}`}
          aria-hidden="true"
        />
      </div>
      <p className="mb-2 text-sm font-semibold">
        {state.monster.name} - Onda {state.monster.wave}
      </p>
      <div className="mx-auto mb-4 h-3 w-full max-w-sm overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-red-500 transition-all" style={{ width: `${hpPct}%` }} />
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        HP {formatIdleNumber(state.monster.hp)} / {formatIdleNumber(state.monster.maxHp)} |
        Recompensa {formatIdleNumber(state.monster.rewardGold)}
      </p>
      <button
        type="button"
        onClick={onClick}
        className="mx-auto flex size-40 items-center justify-center rounded-full border-4 border-amber-300 bg-gradient-to-br from-amber-200 to-orange-300 text-amber-950 shadow-md transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Ataque
      </button>
      <p className="mt-3 text-sm font-medium">+{state.clickDamage.toFixed(0)} de dano por clique</p>
    </div>
  )
}
