import { type IdleState, type IdleUpgradeId, formatIdleNumber } from '../../lib/idle/idle-core'

interface IdleUpgradesProps {
  state: IdleState
  canBuy: (id: IdleUpgradeId) => boolean
  onBuy: (id: IdleUpgradeId) => void
}

const UPGRADE_META: Array<{ id: IdleUpgradeId; title: string; description: string }> = [
  {
    id: 'click_power',
    title: 'Forca do Clique',
    description: 'Aumenta dano ativo por clique.',
  },
  {
    id: 'hero_dps',
    title: 'Treino do Heroi',
    description: 'Aumenta DPS automatico do heroi.',
  },
  {
    id: 'hire_ally',
    title: 'Contratar Aliado',
    description: 'Adiciona um aliado que causa DPS fixo.',
  },
]

export function IdleUpgrades({ state, canBuy, onBuy }: IdleUpgradesProps) {
  return (
    <div className="grid gap-3">
      {UPGRADE_META.map((upgrade) => {
        const data = state.upgrades[upgrade.id]
        const affordable = canBuy(upgrade.id)
        return (
          <div key={upgrade.id} className="rounded-xl border bg-card p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-semibold">{upgrade.title}</p>
              <span className="text-xs text-muted-foreground">Nv. {data.level}</span>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">{upgrade.description}</p>
            <button
              type="button"
              onClick={() => onBuy(upgrade.id)}
              disabled={!affordable}
              className="w-full rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              Comprar ({formatIdleNumber(data.cost)})
            </button>
          </div>
        )
      })}
    </div>
  )
}
