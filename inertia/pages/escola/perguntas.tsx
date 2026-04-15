import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { useQuery } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { MessageCircleQuestion, XCircle, Clock, User, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { EscolaLayout } from '../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { cn } from '../../lib/utils'

type InquiryStatus = 'OPEN' | 'RESOLVED' | 'CLOSED'

type InquiryItem = {
  id: string
  studentId: string
  subject: string
  status: InquiryStatus
  createdAt: string
  updatedAt: string
  student?: {
    id: string
    name: string
  }
  createdByResponsible?: {
    id: string
    name: string
  }
  messages: Array<{
    id: string
    body: string
    authorType: string
    createdAt: string
  }>
  hasUnread: boolean
}

type InquiryListResponse = {
  data: InquiryItem[]
  metadata?: {
    total: number
    currentPage: number
    lastPage: number
  }
}

async function listInquiries(): Promise<InquiryListResponse> {
  const response = await fetch('/api/v1/escola/inquiries', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Falha ao carregar perguntas')
  }

  return response.json()
}

function InquiriesListContent() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['escola-inquiries'],
    queryFn: listInquiries,
  })

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
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircleQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma pergunta</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              As perguntas sao criadas pelos responsaveis e aparecem aqui para voce responder.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
      {inquiries.map((inquiry) => (
        <Link
          key={inquiry.id}
          route="web.escola.perguntas.show"
          routeParams={{ inquiryId: inquiry.id }}
          className="block"
        >
          <Card
            className={cn(
              'border-primary/20 hover:border-primary/40 transition-colors cursor-pointer',
              inquiry.hasUnread && 'bg-muted/50 border-primary/40'
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {inquiry.hasUnread && <div className="h-2 w-2 rounded-full bg-primary" />}
                  <CardTitle className="text-base">
                    Chat com {inquiry.createdByResponsible?.name || 'Responsável'}
                  </CardTitle>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(inquiry.updatedAt), 'HH:mm', { locale: ptBR })}
                </span>
              </div>
              <CardDescription className="flex items-center gap-4 mt-2">
                {inquiry.student && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {inquiry.student.name}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {inquiry.messages[inquiry.messages.length - 1]?.body || 'Sem mensagem'}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {inquiry.messages.length} mensagem{inquiry.messages.length !== 1 ? 's' : ''}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
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
  return (
    <EscolaLayout>
      <Head title="Mensagens" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageCircleQuestion className="h-6 w-6" />
            Mensagens
          </h1>
          <p className="text-muted-foreground">Conversas com os responsáveis sobre os alunos</p>
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
          <InquiriesListContent />
        </ErrorBoundary>
      </div>
    </EscolaLayout>
  )
}
