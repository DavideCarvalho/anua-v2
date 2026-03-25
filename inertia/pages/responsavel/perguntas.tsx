import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MessageCircleQuestion, Plus, XCircle, Loader2, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { useState } from 'react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
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

type InquiryStatus = 'OPEN' | 'RESOLVED' | 'CLOSED'

type InquiryItem = {
  id: string
  studentId: string
  subject: string
  status: InquiryStatus
  createdAt: string
  updatedAt: string
  messages: Array<{
    id: string
    body: string
    authorType: string
    createdAt: string
  }>
}

type InquiryListResponse = {
  data: InquiryItem[]
  metadata?: {
    total: number
    currentPage: number
    lastPage: number
  }
}

const createSchema = z.object({
  subject: z.string().min(3, 'Assunto deve ter pelo menos 3 caracteres').max(255),
  body: z.string().min(1, 'Mensagem é obrigatória'),
})

type CreateFormValues = z.infer<typeof createSchema>

function StatusBadge({ status }: { status: InquiryStatus }) {
  const variants: Record<
    InquiryStatus,
    { label: string; variant: 'default' | 'secondary' | 'outline' }
  > = {
    OPEN: { label: 'Aberta', variant: 'default' },
    RESOLVED: { label: 'Resolvida', variant: 'secondary' },
    CLOSED: { label: 'Fechada', variant: 'outline' },
  }

  const { label, variant } = variants[status] || { label: status, variant: 'outline' }

  return <Badge variant={variant}>{label}</Badge>
}

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

function InquiriesListContent({ studentId }: { studentId: string }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['responsavel-inquiries', studentId],
    queryFn: async (): Promise<InquiryListResponse> => {
      const response = await fetch(`/api/v1/responsavel/students/${studentId}/inquiries`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Falha ao carregar perguntas')
      }

      return response.json()
    },
    enabled: !!studentId,
  })

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

  if (isLoading) {
    return <InquiriesSkeleton />
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">Erro ao carregar perguntas</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Ocorreu um erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const inquiries = data?.data ?? []

  if (inquiries.length === 0) {
    return (
      <>
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircleQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma pergunta</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Você ainda não enviou nenhuma pergunta para este aluno.
            </p>
            <Button className="mt-4" onClick={() => setNewDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova pergunta
            </Button>
          </CardContent>
        </Card>

        <NewInquiryDialog
          open={newDialogOpen}
          onOpenChange={setNewDialogOpen}
          studentId={studentId}
        />
      </>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {inquiries.length} pergunta{inquiries.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" onClick={() => setNewDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova pergunta
        </Button>
      </div>

      <div className="space-y-4">
        {inquiries.map((inquiry) => (
          <Link key={inquiry.id} href={`/responsavel/perguntas/${inquiry.id}`} className="block">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircleQuestion className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{inquiry.subject}</CardTitle>
                  </div>
                  <StatusBadge status={inquiry.status} />
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(inquiry.createdAt), "dd 'de' MMMM 'de' yyyy, HH:mm", {
                    locale: ptBR,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {inquiry.messages[0]?.body || 'Sem mensagem'}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {inquiry.messages.length} mensagem{inquiry.messages.length !== 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <NewInquiryDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        studentId={studentId}
      />
    </>
  )
}

function InquiriesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-5 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-12 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function PerguntasPage() {
  const { studentId } = useSelectedStudent()

  return (
    <ResponsavelLayout>
      <Head title="Perguntas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageCircleQuestion className="h-6 w-6" />
            Perguntas
          </h1>
          <p className="text-muted-foreground">
            Envie perguntas e acompanhe as respostas da escola
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
          <InquiriesListContent studentId={studentId || ''} />
        </ErrorBoundary>
      </div>
    </ResponsavelLayout>
  )
}
