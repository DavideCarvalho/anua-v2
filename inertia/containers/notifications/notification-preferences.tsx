import { useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Settings, Bell, Mail, Smartphone } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Switch } from '../../components/ui/switch'
import { Label } from '../../components/ui/label'
import { Separator } from '../../components/ui/separator'

import { useNotificationPreferencesQueryOptions } from '../../hooks/queries/use-notification-preferences'
import { useUpdateNotificationPreferencesMutation } from '../../hooks/mutations/use-update-notification-preferences'

interface NotificationPreference {
  id: string
  type: string
  channel: string
  enabled: boolean
}

export function NotificationPreferences() {
  const { data } = useSuspenseQuery(useNotificationPreferencesQueryOptions())
  const updateMutation = useUpdateNotificationPreferencesMutation()

  const preferences = (data?.preferences ?? []) as NotificationPreference[]
  const grouped = data?.grouped as Record<string, Record<string, boolean>> ?? {}

  const handleToggle = (type: string, channel: string, currentValue: boolean) => {
    toast.promise(
      updateMutation.mutateAsync({
        preferences: [{ type, channel, enabled: !currentValue }],
      }),
      {
        loading: 'Atualizando preferência...',
        success: 'Preferência atualizada!',
        error: 'Erro ao atualizar preferência',
      }
    )
  }

  // Get unique types from preferences
  const types = [...new Set(preferences.map((p) => p.type))]

  // Group types by category
  const gamificationTypes = types.filter((t) =>
    ['ORDER_APPROVED', 'ORDER_READY', 'ORDER_REJECTED', 'ORDER_PREPARING',
     'ACHIEVEMENT_UNLOCKED', 'CHALLENGE_COMPLETED', 'POINTS_RECEIVED', 'LEVEL_UP'].includes(t)
  )

  const academicTypes = types.filter((t) =>
    ['ASSIGNMENT_CREATED', 'ASSIGNMENT_GRADED', 'ASSIGNMENT_DUE_SOON',
     'GRADE_PUBLISHED', 'ATTENDANCE_MARKED'].includes(t)
  )

  const administrativeTypes = types.filter((t) =>
    ['PAYMENT_DUE', 'PAYMENT_RECEIVED'].includes(t)
  )

  const systemTypes = types.filter((t) =>
    ['SYSTEM_ANNOUNCEMENT', 'MAINTENANCE_SCHEDULED'].includes(t)
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Como funciona?</CardTitle>
          <CardDescription>
            Configure através de quais canais você deseja receber cada tipo de
            notificação. Por padrão, todas são enviadas pelo app.
          </CardDescription>
        </CardHeader>
      </Card>

      {gamificationTypes.length > 0 && (
        <PreferenceSection
          title="Gamificação"
          description="Notificações sobre pedidos, conquistas, desafios e pontos"
          types={gamificationTypes}
          grouped={grouped}
          onToggle={handleToggle}
          isUpdating={updateMutation.isPending}
        />
      )}

      {academicTypes.length > 0 && (
        <PreferenceSection
          title="Acadêmico"
          description="Notificações sobre tarefas, notas e presença"
          types={academicTypes}
          grouped={grouped}
          onToggle={handleToggle}
          isUpdating={updateMutation.isPending}
        />
      )}

      {administrativeTypes.length > 0 && (
        <PreferenceSection
          title="Administrativo"
          description="Notificações sobre pagamentos e contratos"
          types={administrativeTypes}
          grouped={grouped}
          onToggle={handleToggle}
          isUpdating={updateMutation.isPending}
        />
      )}

      {systemTypes.length > 0 && (
        <PreferenceSection
          title="Sistema"
          description="Notificações sobre anúncios e manutenções"
          types={systemTypes}
          grouped={grouped}
          onToggle={handleToggle}
          isUpdating={updateMutation.isPending}
        />
      )}

      {types.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="py-12 text-center">
              <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhuma preferência</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Você ainda não tem preferências de notificação configuradas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface PreferenceSectionProps {
  title: string
  description: string
  types: string[]
  grouped: Record<string, Record<string, boolean>>
  onToggle: (type: string, channel: string, currentValue: boolean) => void
  isUpdating: boolean
}

function PreferenceSection({
  title,
  description,
  types,
  grouped,
  onToggle,
  isUpdating,
}: PreferenceSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {types.map((type, index) => (
          <div key={type}>
            {index > 0 && <Separator className="my-4" />}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">
                  {getNotificationTypeLabel(type)}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {getNotificationTypeDescription(type)}
                </p>
              </div>

              <div className="space-y-3 pl-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Notificação no App</Label>
                  </div>
                  <Switch
                    checked={grouped[type]?.in_app ?? true}
                    onCheckedChange={() => onToggle(type, 'in_app', grouped[type]?.in_app ?? true)}
                    disabled={isUpdating}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Email</Label>
                  </div>
                  <Switch
                    checked={grouped[type]?.email ?? false}
                    onCheckedChange={() => onToggle(type, 'email', grouped[type]?.email ?? false)}
                    disabled={isUpdating}
                  />
                </div>

                <div className="flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Push (Em breve)</Label>
                  </div>
                  <Switch checked={false} disabled={true} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function getNotificationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ORDER_APPROVED: 'Pedido Aprovado',
    ORDER_READY: 'Pedido Pronto',
    ORDER_REJECTED: 'Pedido Rejeitado',
    ORDER_PREPARING: 'Pedido em Preparo',
    ACHIEVEMENT_UNLOCKED: 'Conquista Desbloqueada',
    CHALLENGE_COMPLETED: 'Desafio Concluído',
    POINTS_RECEIVED: 'Pontos Recebidos',
    LEVEL_UP: 'Novo Nível Alcançado',
    ASSIGNMENT_CREATED: 'Nova Tarefa',
    ASSIGNMENT_GRADED: 'Tarefa Avaliada',
    ASSIGNMENT_DUE_SOON: 'Tarefa Vencendo',
    GRADE_PUBLISHED: 'Nota Publicada',
    ATTENDANCE_MARKED: 'Presença Marcada',
    PAYMENT_DUE: 'Pagamento Vencendo',
    PAYMENT_RECEIVED: 'Pagamento Recebido',
    SYSTEM_ANNOUNCEMENT: 'Anúncio do Sistema',
    MAINTENANCE_SCHEDULED: 'Manutenção Agendada',
  }

  return labels[type] || type
}

function getNotificationTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    ORDER_APPROVED: 'Quando seu pedido for aprovado pela escola',
    ORDER_READY: 'Quando seu pedido estiver pronto para retirada',
    ORDER_REJECTED: 'Quando seu pedido for rejeitado',
    ORDER_PREPARING: 'Quando seu pedido estiver sendo preparado',
    ACHIEVEMENT_UNLOCKED: 'Quando você desbloquear uma nova conquista',
    CHALLENGE_COMPLETED: 'Quando você completar um desafio',
    POINTS_RECEIVED: 'Quando você ganhar pontos',
    LEVEL_UP: 'Quando você alcançar um novo nível',
    ASSIGNMENT_CREATED: 'Quando uma nova tarefa for criada',
    ASSIGNMENT_GRADED: 'Quando uma tarefa for avaliada',
    ASSIGNMENT_DUE_SOON: 'Lembrete de tarefas próximas do prazo',
    GRADE_PUBLISHED: 'Quando notas forem publicadas',
    ATTENDANCE_MARKED: 'Quando sua presença for registrada',
    PAYMENT_DUE: 'Lembretes de pagamentos próximos do vencimento',
    PAYMENT_RECEIVED: 'Confirmações de pagamentos recebidos',
    SYSTEM_ANNOUNCEMENT: 'Anúncios importantes do sistema',
    MAINTENANCE_SCHEDULED: 'Avisos sobre manutenções programadas',
  }

  return descriptions[type] || ''
}
