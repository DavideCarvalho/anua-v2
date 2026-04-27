import { Head, router } from '@inertiajs/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MessageCircleQuestion, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { useSelectedStudent } from '../../hooks/use_selected_student'
import { api } from '~/lib/api'

const createSchema = z.object({
  subject: z.string().min(3, 'Assunto deve ter pelo menos 3 caracteres').max(255),
  body: z.string().min(1, 'Mensagem é obrigatória'),
})

type CreateFormValues = z.infer<typeof createSchema>

function StartChatForm({ studentId }: { studentId: string }) {
  const queryClient = useQueryClient()
  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      subject: '',
      body: '',
    },
  })

  const createMutation = useMutation(api.api.v1.responsavel.api.inquiries.create.mutationOptions())

  const onSubmit = async (data: CreateFormValues) => {
    try {
      await createMutation.mutateAsync({ params: { studentId }, body: data })
      queryClient.invalidateQueries({ queryKey: ['responsavel-inquiries', studentId] })
      toast.success('Conversa iniciada com sucesso')
      form.reset()
      const currentUrl =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : '/responsavel/chat'
      router.visit(currentUrl)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao criar pergunta')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subject">Assunto</Label>
        <Input
          id="subject"
          placeholder="Ex: Dúvida sobre mensalidade"
          {...form.register('subject')}
        />
        {form.formState.errors.subject && (
          <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Mensagem</Label>
        <Textarea
          id="body"
          rows={6}
          placeholder="Descreva sua dúvida ou pergunta..."
          {...form.register('body')}
        />
        {form.formState.errors.body && (
          <p className="text-sm text-destructive">{form.formState.errors.body.message}</p>
        )}
      </div>

      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enviar primeira mensagem
      </Button>
    </form>
  )
}

function StartChatContent({ studentId }: { studentId: string }) {
  if (!studentId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageCircleQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Selecione um aluno</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Selecione um aluno para visualizar as perguntas.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iniciar conversa</CardTitle>
        <CardDescription>Envie sua primeira mensagem para abrir o chat com a escola.</CardDescription>
      </CardHeader>
      <CardContent>
        <StartChatForm studentId={studentId} />
      </CardContent>
    </Card>
  )
}

export default function PerguntasPage() {
  const { studentId } = useSelectedStudent()

  return (
    <ResponsavelLayout>
      <Head title="Chat" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageCircleQuestion className="h-6 w-6" />
            Chat
          </h1>
          <p className="text-muted-foreground">
            Converse com a escola e acompanhe as respostas
          </p>
        </div>

        <ErrorBoundary
          fallback={
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="mx-auto h-12 w-12 text-destructive" />
                <h3 className="mt-4 text-lg font-semibold">Erro ao carregar perguntas</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ocorreu um erro ao renderizar o componente.
                </p>
              </CardContent>
            </Card>
          }
        >
          <StartChatContent studentId={studentId || ''} />
        </ErrorBoundary>
      </div>
    </ResponsavelLayout>
  )
}
