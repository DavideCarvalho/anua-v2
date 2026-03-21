import { Head, router } from '@inertiajs/react'
import { useState } from 'react'
import { AlunoLayout } from '../../../components/layouts/aluno-layout'
import { CLASS_INFO, type GameClass } from '../../../types/game'

interface CreateCharacterProps {
  studentName: string
}

const CLASSES: GameClass[] = ['mage', 'warrior', 'rogue', 'paladin']

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
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Bem-vindo ao Reino Mágico!</h1>
          <p className="mt-2 text-muted-foreground">
            Crie seu personagem para começar sua aventura
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Nome do Personagem
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="Digite o nome..."
              className="w-full rounded-lg border bg-background px-4 py-3 text-lg"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium">Escolha sua Classe</label>
            <div className="grid grid-cols-2 gap-4">
              {CLASSES.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    selectedClass === cls
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <h3 className={`text-lg font-bold ${CLASS_INFO[cls].color}`}>
                    {CLASS_INFO[cls].name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {CLASS_INFO[cls].description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full rounded-lg bg-primary px-6 py-3 text-lg font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Criando...' : 'Criar Personagem'}
          </button>
        </form>
      </div>
    </AlunoLayout>
  )
}
