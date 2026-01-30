import { Head } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { Bell, Mail, CreditCard, MessageSquare, Trophy, AlertCircle } from 'lucide-react'
import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { tuyau } from '../../lib/api'

const $route = tuyau.api.v1.responsavel.notifications.$get

function useNotificationsQueryOptions() {
  return {
    queryKey: ['responsavel', 'notifications'],
    queryFn: async () => {
      const response = await $route()
      if (response.error) {
        throw new Error((response.error as any).value?.message || 'Erro ao carregar notificações')
      }
      return response.data
    },
  }
}

const TYPE_ICONS: Record<string, typeof Bell> = {
  POST: MessageSquare,
  GRADE: Trophy,
  PAYMENT: CreditCard,
  GENERAL: Bell,
  ASSIGNMENT_CREATED: MessageSquare,
  ASSIGNMENT_GRADED: Trophy,
  PAYMENT_DUE: CreditCard,
  PAYMENT_RECEIVED: CreditCard,
  PAYMENT_OVERDUE: CreditCard,
  EVENT_CREATED: MessageSquare,
  GENERAL_ANNOUNCEMENT: Bell,
}

function NotificacoesContent() {
  const { data: rawNotificationsData, isLoading, isError, error } = useQuery(useNotificationsQueryOptions())
  const notificationsData = rawNotificationsData as any

  if (isLoading) {
    return <NotificacoesSkeleton />
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar notificações: {error instanceof Error ? error.message : 'Erro desconhecido'}
        </AlertDescription>
      </Alert>
    )
  }

  if (!notificationsData) {
    return null
  }

  const formatDate = (date: Date | string) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diffMs = now.getTime() - notifDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins}min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(notifDate)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notificações</h2>
          <p className="text-muted-foreground">
            {notificationsData.unreadCount > 0
              ? `${notificationsData.unreadCount} não lida(s)`
              : 'Todas as notificações lidas'}
          </p>
        </div>
      </div>

      {/* Lista de Notificações */}
      {notificationsData.data.length > 0 ? (
        <div className="space-y-2">
          {notificationsData.data.map((notification: any) => {
            const Icon = TYPE_ICONS[notification.type as keyof typeof TYPE_ICONS] || Bell

            return (
              <Card
                key={notification.id}
                className={notification.isRead ? 'opacity-60' : 'border-primary/50'}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-full p-2 ${
                        notification.isRead ? 'bg-gray-100' : 'bg-primary/10'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          notification.isRead ? 'text-gray-600' : 'text-primary'
                        }`}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold">{notification.title}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                        </div>
                        {!notification.isRead && (
                          <Badge variant="default" className="bg-primary">
                            Nova
                          </Badge>
                        )}
                      </div>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhuma notificação</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Você não tem notificações no momento.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function NotificacoesSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function NotificacoesPage() {
  return (
    <ResponsavelLayout>
      <Head title="Notificações" />
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro inesperado: {(error as Error).message}
              <button onClick={resetErrorBoundary} className="ml-2 underline">
                Tentar novamente
              </button>
            </AlertDescription>
          </Alert>
        )}
      >
        <NotificacoesContent />
      </ErrorBoundary>
    </ResponsavelLayout>
  )
}
