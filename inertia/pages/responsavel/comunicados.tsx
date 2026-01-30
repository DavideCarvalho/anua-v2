import { Head } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { Bell, MessageSquare, Calendar, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

import { useNotificationsQueryOptions } from '../../hooks/queries/use_notifications'

function ComunicadosContent() {
  const { data, isLoading, isError, error } = useQuery(useNotificationsQueryOptions({ limit: 20 }))

  if (isLoading) {
    return <ComunicadosSkeleton />
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">Erro ao carregar comunicados</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Ocorreu um erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const notifications = data?.data ?? []

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum comunicado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Voce nao possui comunicados ou notificacoes.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={notification.readAt ? 'opacity-75' : 'border-primary/50'}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{notification.title}</CardTitle>
              </div>
              {!notification.readAt && (
                <Badge variant="default" className="text-xs">
                  Novo
                </Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {format(new Date(notification.createdAt), "dd 'de' MMMM 'de' yyyy, HH:mm", {
                locale: ptBR,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{notification.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ComunicadosSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
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

export default function ComunicadosPage() {
  return (
    <ResponsavelLayout>
      <Head title="Comunicados" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Comunicados
          </h1>
          <p className="text-muted-foreground">
            Comunicados e notificacoes da escola
          </p>
        </div>

        <ErrorBoundary
          fallback={
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="mx-auto h-12 w-12 text-destructive" />
                <h3 className="mt-4 text-lg font-semibold">Erro ao carregar comunicados</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ocorreu um erro ao renderizar o componente.
                </p>
              </CardContent>
            </Card>
          }
        >
          <ComunicadosContent />
        </ErrorBoundary>
      </div>
    </ResponsavelLayout>
  )
}
