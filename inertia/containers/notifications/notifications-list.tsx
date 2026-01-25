import { useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Bell, Check, CheckCheck } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'

import { useNotificationsQueryOptions } from '../../hooks/queries/use_notifications'
import { useMarkNotificationReadMutation } from '../../hooks/mutations/use_mark_notification_read'
import { useMarkAllNotificationsReadMutation } from '../../hooks/mutations/use_mark_all_notifications_read'

interface NotificationsListProps {
  onNotificationClick?: (notification: Notification) => void
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  channel: string
  status: string
  readAt: string | null
  actionUrl: string | null
  createdAt: string
}

export function NotificationsList({ onNotificationClick }: NotificationsListProps) {
  const { data } = useSuspenseQuery(useNotificationsQueryOptions({ page: 1, limit: 20 }))

  const markReadMutation = useMarkNotificationReadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation()

  const notifications = (data?.data ?? []) as Notification[]
  const unreadCount = data?.unreadCount ?? 0

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.readAt) {
      toast.promise(markReadMutation.mutateAsync({ id: notification.id }), {
        loading: 'Marcando como lida...',
        success: 'Notificação marcada como lida',
        error: 'Erro ao marcar como lida',
      })
    }

    onNotificationClick?.(notification)
  }

  const handleMarkAllAsRead = () => {
    toast.promise(markAllReadMutation.mutateAsync(), {
      loading: 'Marcando todas como lidas...',
      success: 'Todas as notificações foram marcadas como lidas!',
      error: 'Erro ao marcar notificações como lidas',
    })
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="py-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma notificação</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Você não tem notificações no momento.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {unreadCount} notificação(ões) não lida(s)
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Marcar todas como lidas
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                className={cn(
                  'w-full px-6 py-4 text-left transition-colors hover:bg-muted',
                  !notification.readAt && 'bg-muted/50'
                )}
                onClick={() => handleNotificationClick(notification)}
                disabled={markReadMutation.isPending}
              >
                <div className="flex gap-4">
                  <div className="mt-1">
                    {notification.readAt ? (
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/20" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className={cn(
                            'text-sm',
                            !notification.readAt && 'font-semibold'
                          )}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0">
                        {getNotificationTypeLabel(notification.type)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </p>
                      {!notification.readAt && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 py-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleNotificationClick(notification)
                          }}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Marcar como lida
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getNotificationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ORDER_APPROVED: 'Pedido',
    ORDER_READY: 'Pedido',
    ORDER_REJECTED: 'Pedido',
    ORDER_PREPARING: 'Pedido',
    ACHIEVEMENT_UNLOCKED: 'Conquista',
    CHALLENGE_COMPLETED: 'Desafio',
    POINTS_RECEIVED: 'Pontos',
    LEVEL_UP: 'Nível',
    ASSIGNMENT_GRADED: 'Tarefa',
    PAYMENT_DUE: 'Financeiro',
  }

  return labels[type] || 'Sistema'
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'agora'
  if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
  if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`

  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
