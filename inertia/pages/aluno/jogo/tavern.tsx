import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../../components/layouts/aluno-layout'
import type { GameCharacter } from '../../../types/game'
import { CLASS_INFO, LOCATION_INFO } from '../../../types/game'

interface TavernPageProps {
  character: GameCharacter
}

export default function TavernPage({ character }: TavernPageProps) {
  const classInfo = CLASS_INFO[character.class]

  return (
    <AlunoLayout>
      <Head title="Taverna" />
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-8 rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <span className="text-2xl">⚔️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{character.name}</h1>
              <p className={`text-sm ${classInfo.color}`}>
                Nível {character.level} {classInfo.name}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{character.gold}</p>
              <p className="text-xs text-muted-foreground">Gold</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {character.energy}/{character.maxEnergy}
              </p>
              <p className="text-xs text-muted-foreground">Energia</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{character.currentWave}</p>
              <p className="text-xs text-muted-foreground">Wave</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {Object.entries(LOCATION_INFO).map(([key, info]) => (
            <button
              key={key}
              className="rounded-lg border bg-card p-4 text-center transition-all hover:border-primary hover:bg-card/80"
            >
              <span className="text-3xl">{info.icon}</span>
              <h3 className="mt-2 font-bold">{info.name}</h3>
              <p className="text-xs text-muted-foreground">{info.description}</p>
            </button>
          ))}
        </div>
      </div>
    </AlunoLayout>
  )
}
