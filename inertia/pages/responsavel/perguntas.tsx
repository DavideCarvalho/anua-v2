import { Head } from '@inertiajs/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MessageCircleQuestion, Plus, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
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

function NewInquiryDialog({
  open,
  onOpenChange,
  studentId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
}) {
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
      toast.success('Pergunta criada com sucesso')
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao criar pergunta')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova pergunta</DialogTitle>
          <DialogDescription>Envie uma pergunta ou dúvida para a escola</DialogDescription>
        </DialogHeader>

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
              rows={5}
              placeholder="Descreva sua dúvida ou pergunta..."
              {...form.register('body')}
            />
            {form.formState.errors.body && (
              <p className="text-sm text-destructive">{form.formState.errors.body.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function StartChatContent({ studentId }: { studentId: string }) {
  const [newDialogOpen, setNewDialogOpen] = useState(false)

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
    <>
      <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Conversa</CardTitle>
            <CardDescription>Nenhum chat iniciado</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setNewDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Iniciar conversa
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <MessageCircleQuestion className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum chat ainda</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Envie sua primeira mensagem para iniciar a conversa com a escola.
            </p>
            <Button className="mt-4" onClick={() => setNewDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Iniciar conversa
            </Button>
          </CardContent>
        </Card>
      </div>

      <NewInquiryDialog open={newDialogOpen} onOpenChange={setNewDialogOpen} studentId={studentId} />
    </>
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
