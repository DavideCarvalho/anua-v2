import { useQuery } from '@tanstack/react-query'
import { Bell, Check, CheckCheck } from 'lucide-react'
import type { MouseEvent } from 'react'

import { Link } from '@tuyau/inertia/react'

import { cn } from '../../lib/utils'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { ScrollArea } from '../ui/scroll-area'
import { useNotificationsQueryOptions } from '../../hooks/queries/use_notifications'
import { useMarkNotificationReadMutation } from '../../hooks/mutations/use_mark_notification_read'
import { useMarkAllNotificationsReadMutation } from '../../hooks/mutations/use_mark_all_notifications_read'

interface NotificationBellProps {
  allNotificationsRoute: 'web.escola.notificacoes' | 'web.responsavel.comunicados'
}

interface NotificationItem {
  id: string
  title: string
  message?: string
  body?: string
  type: string
  isRead?: boolean
  readAt?: string | null
  createdAt: string
}

export function NotificationBell({ allNotificationsRoute }: NotificationBellProps) {
  const { data, isLoading } = useQuery({
    ...useNotificationsQueryOptions({ page: 1, limit: 8 }),
    refetchInterval: 60_000,
  })

  const markReadMutation = useMarkNotificationReadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation()

  const notifications = ((data?.data ?? []) as NotificationItem[]).map((notification) => {
    const isRead = notification.isRead ?? Boolean(notification.readAt)

    return {
      ...notification,
      isRead,
      message: notification.message ?? notification.body ?? '',
    }
  })

  const unreadCount = data?.unreadCount ?? notifications.filter((n) => !n.isRead).length

  const handleMarkRead = async (notificationId: string, event?: MouseEvent<HTMLElement>) => {
    event?.stopPropagation()

    await markReadMutation.mutateAsync(notificationId)
  }

  const handleMarkAllRead = async () => {
    await markAllReadMutation.mutateAsync()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificacoes">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notificacoes</p>
            <p className="text-xs text-muted-foreground">
              {isLoading
                ? 'Carregando...'
                : unreadCount > 0
                  ? `${unreadCount} nao lida${unreadCount > 1 ? 's' : ''}`
                  : 'Tudo em dia'}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="mr-1 h-4 w-4" />
              Marcar todas
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Nenhuma notificacao</p>
          </div>
        ) : (
          <ScrollArea className="h-[320px]">
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={cn(
                    'w-full px-4 py-3 text-left transition-colors hover:bg-muted/60',
                    !notification.isRead && 'bg-muted/30'
                  )}
                  onClick={(event) => {
                    if (!notification.isRead) {
                      void handleMarkRead(notification.id, event)
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'mt-2 h-2 w-2 rounded-full',
                        notification.isRead ? 'bg-muted-foreground/30' : 'bg-primary'
                      )}
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className={cn('text-sm', !notification.isRead && 'font-semibold')}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={(event) => {
                              void handleMarkRead(notification.id, event)
                            }}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {getNotificationTypeLabel(notification.type)}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {formatRelativeDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="border-t p-2">
          <Link
            route={allNotificationsRoute}
            params={undefined}
            className="flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Ver todas
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function getNotificationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ASSIGNMENT_CREATED: 'Atividade',
    ASSIGNMENT_GRADED: 'Atividade',
    ATTENDANCE_MARKED: 'Frequencia',
    PAYMENT_DUE: 'Financeiro',
    PAYMENT_RECEIVED: 'Financeiro',
    LEVEL_UP: 'Gamificacao',
    ACHIEVEMENT_UNLOCKED: 'Gamificacao',
    STREAK_MILESTONE: 'Gamificacao',
    SYSTEM_ANNOUNCEMENT: 'Sistema',
    GENERAL_ANNOUNCEMENT: 'Sistema',
  }

  return labels[type] || 'Sistema'
}

function formatRelativeDate(date: string): string {
  const createdAt = new Date(date)
  const now = new Date()
  const diff = now.getTime() - createdAt.getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)

  if (minutes < 1) return 'agora'
  if (minutes < 60) return `ha ${minutes} min`
  if (hours < 24) return `ha ${hours} h`
  if (days < 7) return `ha ${days} d`

  return createdAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })
}
