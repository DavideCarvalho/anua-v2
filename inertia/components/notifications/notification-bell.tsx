import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, CheckCheck } from 'lucide-react'
import type { MouseEvent } from 'react'

import { Link } from '@adonisjs/inertia/react'

import { cn } from '../../lib/utils'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { ScrollArea } from '../ui/scroll-area'
import { api } from '~/lib/api'
import { NotificationMessage } from './notification-message'

interface NotificationBellProps {
  allNotificationsRoute: 'web.escola.notificacoes' | 'web.responsavel.comunicados'
}

type NotificationItem = {
  id: string
  title: string
  message: string
  type: string
  createdAt: Date | string
  isRead?: boolean
  readAt?: Date | string | null
}

export function NotificationBell({ allNotificationsRoute }: NotificationBellProps) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    ...api.api.v1.notifications.index.queryOptions({ query: { page: 1, limit: 8 } }),
    refetchInterval: 10_000,
  })

  const markReadMutation = useMutation(api.api.v1.notifications.markRead.mutationOptions())
  const markAllReadMutation = useMutation(api.api.v1.notifications.markAllRead.mutationOptions())

  const notificationResponse = data as { data: NotificationItem[]; unreadCount: number } | undefined

  const notifications = (notificationResponse?.data ?? []).map((notification: NotificationItem) => {
    const isRead = notification.isRead ?? Boolean(notification.readAt)

    return {
      ...notification,
      isRead,
    }
  })

  const unreadCount =
    notificationResponse?.unreadCount ??
    notifications.filter((n: { isRead: boolean }) => !n.isRead).length

  const handleMarkRead = async (notificationId: string, event?: MouseEvent<HTMLElement>) => {
    event?.stopPropagation()

    await markReadMutation.mutateAsync({ params: { id: notificationId } })
    await queryClient.invalidateQueries({
      queryKey: api.api.v1.notifications.index.pathKey(),
    })
  }

  const handleMarkAllRead = async () => {
    await markAllReadMutation.mutateAsync({})
    await queryClient.invalidateQueries({
      queryKey: api.api.v1.notifications.index.pathKey(),
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          data-testid="notification-bell"
          id="notification-bell-trigger"
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notificações"
        >
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
            <p className="text-sm font-semibold">Notificações</p>
            <p className="text-xs text-muted-foreground">
              {isLoading
                ? 'Carregando...'
                : unreadCount > 0
                  ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}`
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
              {notifications.map((notification: NotificationItem & { isRead: boolean }) => (
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

                      <NotificationMessage
                        message={notification.message}
                        className="mt-1 line-clamp-2 text-xs text-muted-foreground"
                      />
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
            routeParams={undefined}
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
    ASSIGNMENT_SUBMITTED: 'Atividade',
    ASSIGNMENT_GRADED: 'Atividade',
    EXAM_SCHEDULED: 'Prova',
    EXAM_GRADE_AVAILABLE: 'Prova',
    ATTENDANCE_MARKED: 'Frequência',
    ABSENCE_REPORTED: 'Frequência',
    SCHEDULE_CHANGED: 'Horário',
    PAYMENT_DUE: 'Financeiro',
    PAYMENT_RECEIVED: 'Financeiro',
    PAYMENT_OVERDUE: 'Financeiro',
    AGREEMENT_PROPOSAL: 'Acordo',
    AGREEMENT_PROPOSAL_ACCEPTED: 'Acordo',
    AGREEMENT_PROPOSAL_REJECTED: 'Acordo',
    EVENT_CREATED: 'Evento',
    EVENT_REMINDER: 'Evento',
    PARENTAL_CONSENT_REQUESTED: 'Autorização',
    PARENTAL_CONSENT_REMINDER: 'Autorização',
    POST_LIKED: 'Social',
    POST_COMMENTED: 'Social',
    COMMENT_REPLIED: 'Social',
    POINTS_EARNED: 'Gamificação',
    LEVEL_UP: 'Gamificação',
    ACHIEVEMENT_UNLOCKED: 'Gamificação',
    STREAK_MILESTONE: 'Gamificação',
    STORE_ORDER_STATUS: 'Loja',
    SYSTEM_ANNOUNCEMENT: 'Sistema',
    MAINTENANCE_SCHEDULED: 'Sistema',
    INQUIRY_CREATED: 'Atendimento',
    INQUIRY_MESSAGE: 'Atendimento',
    INQUIRY_RESOLVED: 'Atendimento',
    ENROLLMENT_STARTED: 'Matrícula',
    ENROLLMENT_DOCUMENT_REJECTED: 'Matrícula',
    ENROLLMENT_DOCUMENT_APPROVED: 'Matrícula',
    ENROLLMENT_ALL_DOCUMENTS_APPROVED: 'Matrícula',
    ENROLLMENT_SIGNATURE_PENDING: 'Matrícula',
    ENROLLMENT_PAYMENT_RECEIVED: 'Matrícula',
    ENROLLMENT_REMINDER: 'Matrícula',
    ENROLLMENT_COMPLETED: 'Matrícula',
    ACADEMIC_DIGEST_DAILY: 'Resumo',
    ACADEMIC_DIGEST_WEEKLY: 'Resumo',
    EXPORT_READY: 'Exportação',
  }

  return labels[type] || 'Sistema'
}

function formatRelativeDate(date: Date | string): string {
  const createdAt = new Date(date)
  return createdAt.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}
