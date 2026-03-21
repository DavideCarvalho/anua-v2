import { Head, router } from '@inertiajs/react'
import { useState } from 'react'
import { AlunoLayout } from '../../../components/layouts/aluno-layout'
import { CLASS_INFO, type GameClass } from '../../../types/game'
import { Button } from '../../../components/ui/8bit/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/8bit/card'

interface CreateCharacterProps {
  studentName: string
}

const CLASSES: GameClass[] = ['mage', 'warrior', 'barbarian']

const CLASS_IMAGES: Record<GameClass, string> = {
  mage: '/images/game/classes/mage.png',
  warrior: '/images/game/classes/warrior.png',
  barbarian: '/images/game/classes/barbarian.png',
}

export default function CreateCharacterPage({ studentName: _studentName }: CreateCharacterProps) {
  const [name, setName] = useState('')
  const [selectedClass, setSelectedClass] = useState<GameClass>('warrior')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      await router.post('/api/game/characters', {
        name: name.trim(),
        class: selectedClass,
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar personagem')
      setIsSubmitting(false)
    }
  }

  return (
    <AlunoLayout>
      <Head title="Criar Personagem" />
      <div className="mx-auto max-w-4xl p-6">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bem-vindo ao Reino Mágico!</CardTitle>
            <CardDescription>Crie seu personagem para começar sua aventura</CardDescription>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nome do Personagem</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                placeholder="Digite o nome..."
                className="retro w-full rounded-none border-2 border-foreground bg-background px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Escolha sua Classe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {CLASSES.map((cls) => (
                  <div
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`cursor-pointer transition-all ${
                      selectedClass === cls ? 'ring-4 ring-primary' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Card className="overflow-hidden">
                      <div className="aspect-square bg-gradient-to-b from-primary/20 to-background p-4">
                        <img
                          src={CLASS_IMAGES[cls]}
                          alt={CLASS_INFO[cls].name}
                          className="h-full w-full object-contain pixelated"
                        />
                      </div>
                      <CardHeader className="p-3">
                        <CardTitle className={`text-center ${CLASS_INFO[cls].color}`}>
                          {CLASS_INFO[cls].name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-center text-xs text-muted-foreground">
                          {CLASS_INFO[cls].description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-red-500 bg-red-500/10">
              <CardContent className="p-4">
                <p className="text-sm text-red-500">{error}</p>
              </CardContent>
            </Card>
          )}

          <Button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full py-4 text-lg"
          >
            {isSubmitting ? 'Criando...' : 'Criar Personagem'}
          </Button>
        </form>
      </div>
    </AlunoLayout>
  )
}
