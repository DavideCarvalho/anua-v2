import { Head, router } from '@inertiajs/react'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
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
import { api } from '~/lib/api'

const CLASSES: GameClass[] = ['mage', 'warrior', 'dwarf']

const CLASS_IMAGES: Record<GameClass, string> = {
  mage: '/images/game/classes/mage.png',
  warrior: '/images/game/classes/warrior.png',
  dwarf: '/images/game/classes/dwarf.png',
}

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50),
  class: z.enum(['mage', 'warrior', 'dwarf']),
})

type FormValues = z.infer<typeof schema>

interface CreateCharacterProps {
  studentName: string
}

export default function CreateCharacterPage({ studentName: _studentName }: CreateCharacterProps) {
  const createCharacter = useMutation(api.api.v1.game.createCharacter.mutationOptions())

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      name: '',
      class: 'warrior',
    },
  })

  async function handleSubmit(values: FormValues) {
    try {
      await createCharacter.mutateAsync({
        body: {
          name: values.name,
          class: values.class,
        },
      })
      toast.success('Personagem criado com sucesso!')
      router.visit('/aluno/jogo')
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao criar personagem')
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

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nome do Personagem</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                {...form.register('name')}
                maxLength={50}
                placeholder="Digite o nome..."
                className="retro w-full rounded-none border-2 border-foreground bg-background px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {form.formState.errors.name && (
                <p className="mt-2 text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Escolha sua Classe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {CLASSES.map((cls) => (
                  <div
                    key={cls}
                    onClick={() => form.setValue('class', cls)}
                    className={`cursor-pointer transition-all ${
                      form.watch('class') === cls
                        ? 'ring-4 ring-primary'
                        : 'opacity-70 hover:opacity-100'
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

          <Button
            type="submit"
            disabled={!form.formState.isValid || createCharacter.isPending}
            className="w-full py-4 text-lg"
          >
            {createCharacter.isPending ? 'Criando...' : 'Criar Personagem'}
          </Button>
        </form>
      </div>
    </AlunoLayout>
  )
}
