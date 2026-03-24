import { Head, usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MessageCircleQuestion,
  XCircle,
  Loader2,
  Calendar,
  CheckCircle,
  Send,
  ArrowLeft,
  Paperclip,
  User,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { useMemo } from 'react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Skeleton } from '../../components/ui/skeleton'
import type { SharedProps } from '../../lib/types'

type InquiryStatus = 'OPEN' | 'RESOLVED' | 'CLOSED'

type Attachment = {
  id: string
  messageId: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
}

type Message = {
  id: string
  inquiryId: string
  authorId: string
  authorType: 'RESPONSIBLE' | 'TEACHER' | 'COORDINATOR' | 'DIRECTOR'
  body: string
  createdAt: string
  author?: {
    id: string
    name: string
  }
  attachments?: Attachment[]
}

type InquiryDetail = {
  id: string
  studentId: string
  subject: string
  status: InquiryStatus
  createdAt: string
  updatedAt: string
  resolvedAt?: string | null
  resolvedBy?: string | null
  student?: {
    id: string
    name: string
  }
  createdByResponsible?: {
    id: string
    name: string
  }
  resolvedByUser?: {
    id: string
    name: string
  }
  messages: Message[]
}

const messageSchema = z.object({
  body: z.string().min(1, 'Mensagem é obrigatória'),
})

type MessageFormValues = z.infer<typeof messageSchema>

async function fetchInquiry(inquiryId: string): Promise<InquiryDetail> {
  const response = await fetch(`/api/v1/responsavel/inquiries/${inquiryId}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Falha ao carregar pergunta')
  }

  return response.json()
}

async function createMessage(inquiryId: string, data: MessageFormValues): Promise<InquiryDetail> {
  const response = await fetch(`/api/v1/responsavel/inquiries/${inquiryId}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Falha ao enviar mensagem')
  }

  return response.json()
}

async function resolveInquiry(inquiryId: string): Promise<InquiryDetail> {
  const response = await fetch(`/api/v1/responsavel/inquiries/${inquiryId}/resolve`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Falha ao resolver pergunta')
  }

  return response.json()
}

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

function AuthorBadge({ authorType }: { authorType: Message['authorType'] }) {
  const labels: Record<Message['authorType'], string> = {
    RESPONSIBLE: 'Responsável',
    TEACHER: 'Professor',
    COORDINATOR: 'Coordenador',
    DIRECTOR: 'Diretor',
  }

  return (
    <Badge variant="outline" className="text-xs">
      {labels[authorType] || authorType}
    </Badge>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function MessageBubble({ message }: { message: Message }) {
  const isResponsible = message.authorType === 'RESPONSIBLE'

  return (
    <div className={`flex ${isResponsible ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isResponsible ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{message.author?.name || 'Usuário'}</span>
          <AuthorBadge authorType={message.authorType} />
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.body}</p>
        <p className="text-xs opacity-70 mt-1">
          {format(new Date(message.createdAt), "dd/MM/yyyy 'às' HH:mm", {
            locale: ptBR,
          })}
        </p>
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 text-xs underline ${
                  isResponsible ? 'text-primary-foreground' : 'text-primary'
                }`}
              >
                <Paperclip className="h-3 w-3" />
                {attachment.fileName} ({formatFileSize(attachment.fileSize)})
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function InquiryDetailContent({ inquiryId }: { inquiryId: string }) {
  const queryClient = useQueryClient()
  const studentId = useMemo(() => {
    const url = new URL(window.location.href)
    return url.searchParams.get('aluno')
  }, [])

  const {
    data: inquiry,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['responsavel-inquiry', inquiryId],
    queryFn: () => fetchInquiry(inquiryId),
  })

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      body: '',
    },
  })

  const messageMutation = useMutation({
    mutationFn: (data: MessageFormValues) => createMessage(inquiryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responsavel-inquiry', inquiryId] })
      queryClient.invalidateQueries({ queryKey: ['responsavel-inquiries'] })
      toast.success('Mensagem enviada com sucesso')
      form.reset()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const resolveMutation = useMutation({
    mutationFn: () => resolveInquiry(inquiryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responsavel-inquiry', inquiryId] })
      queryClient.invalidateQueries({ queryKey: ['responsavel-inquiries'] })
      toast.success('Pergunta marcada como resolvida')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const onSendMessage = (data: MessageFormValues) => {
    messageMutation.mutate(data)
  }

  const handleResolve = () => {
    resolveMutation.mutate()
  }

  const isOpen = inquiry?.status === 'OPEN'

  if (isLoading) {
    return <InquiryDetailSkeleton />
  }

  if (isError || !inquiry) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">Erro ao carregar pergunta</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Ocorreu um erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={studentId ? `/responsavel/perguntas?aluno=${studentId}` : '/responsavel/perguntas'}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircleQuestion className="h-5 w-5 text-primary" />
                {inquiry.subject}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(inquiry.createdAt), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </span>
                {inquiry.student && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {inquiry.student.name}
                  </span>
                )}
              </CardDescription>
            </div>
            <StatusBadge status={inquiry.status} />
          </div>
        </CardHeader>
        <CardContent>
          {inquiry.resolvedAt && (
            <div className="mb-4 p-3 bg-muted rounded-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                Resolvida em{' '}
                {format(new Date(inquiry.resolvedAt), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
                {inquiry.resolvedByUser && ` por ${inquiry.resolvedByUser.name}`}
              </span>
            </div>
          )}

          <div className="space-y-4 mb-6">
            {inquiry.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>

          {isOpen && (
            <div className="border-t pt-4 space-y-4">
              <form onSubmit={form.handleSubmit(onSendMessage)} className="space-y-3">
                <Textarea
                  placeholder="Digite sua mensagem..."
                  rows={3}
                  {...form.register('body')}
                />
                {form.formState.errors.body && (
                  <p className="text-sm text-destructive">{form.formState.errors.body.message}</p>
                )}
                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={messageMutation.isPending}>
                    {messageMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Enviar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResolve}
                    disabled={resolveMutation.isPending}
                  >
                    {resolveMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Marcar como resolvida
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function InquiryDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-24" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-end">
                <Skeleton className="h-24 w-[80%] rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PerguntaDetailPage() {
  const { params } = usePage<SharedProps & { params: { inquiryId: string } }>().props as any
  const inquiryId = params?.inquiryId || window.location.pathname.split('/').pop()

  return (
    <ResponsavelLayout>
      <Head title="Detalhe da pergunta" />

      <ErrorBoundary
        fallback={
          <Card>
            <CardContent className="py-12 text-center">
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <h3 className="mt-4 text-lg font-semibold">Erro ao carregar pergunta</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Ocorreu um erro ao renderizar o componente.
              </p>
            </CardContent>
          </Card>
        }
      >
        <InquiryDetailContent inquiryId={inquiryId} />
      </ErrorBoundary>
    </ResponsavelLayout>
  )
}
