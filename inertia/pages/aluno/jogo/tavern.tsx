import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../../components/layouts/aluno-layout'
import type { GameCharacter } from '../../../types/game'
import { CLASS_INFO, LOCATION_INFO } from '../../../types/game'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/8bit/card'
import HealthBar from '../../../components/ui/8bit/health-bar'
import ManaBar from '../../../components/ui/8bit/mana-bar'
import XpBar from '../../../components/ui/8bit/xp-bar'

interface TavernPageProps {
  character: GameCharacter
}

const CLASS_IMAGES: Record<string, string> = {
  mage: '/images/game/classes/mage.png',
  warrior: '/images/game/classes/warrior.png',
  dwarf: '/images/game/classes/dwarf.png',
}

export default function TavernPage({ character }: TavernPageProps) {
  const classInfo = CLASS_INFO[character.class]

  return (
    <AlunoLayout>
      <Head title="Taverna" />
      <div className="mx-auto max-w-4xl p-6">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="size-24 overflow-hidden rounded-none border-2 border-foreground bg-primary/10 p-2">
                <img
                  src={CLASS_IMAGES[character.class]}
                  alt={classInfo.name}
                  className="h-full w-full object-contain pixelated"
                />
              </div>
              <div className="flex-1">
                <h1 className="retro text-2xl">{character.name}</h1>
                <p className={`text-sm ${classInfo.color}`}>
                  Nível {character.level} {classInfo.name}
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">HP</span>
                    <HealthBar value={100} className="h-4 flex-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">MP</span>
                    <ManaBar value={100} className="h-4 flex-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">XP</span>
                    <XpBar value={character.experience} className="h-4 flex-1" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-4 text-center">
              <Card>
                <CardContent className="p-3">
                  <p className="retro text-xl text-yellow-500">{character.gold}</p>
                  <p className="text-xs text-muted-foreground">Gold</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="retro text-xl text-blue-500">
                    {character.energy}/{character.maxEnergy}
                  </p>
                  <p className="text-xs text-muted-foreground">Energia</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="retro text-xl text-red-500">{character.attack}</p>
                  <p className="text-xs text-muted-foreground">Ataque</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="retro text-xl text-green-500">{character.defense}</p>
                  <p className="text-xs text-muted-foreground">Defesa</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Explorar</CardTitle>
            <CardDescription>Escolha um local para aventurar</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          {Object.entries(LOCATION_INFO).map(([key, info]) => (
            <Card
              key={key}
              className="cursor-pointer transition-all hover:ring-2 hover:ring-primary"
            >
              <CardContent className="p-4 text-center">
                <span className="text-4xl">{info.icon}</span>
                <h3 className="retro mt-2">{info.name}</h3>
                <p className="text-xs text-muted-foreground">{info.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AlunoLayout>
  )
}
