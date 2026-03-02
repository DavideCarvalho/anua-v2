import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CreditCard,
  Building2,
  MoreHorizontal,
  Pause,
  Play,
  XCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import type { Route } from '@tuyau/core/types'
import { api } from '~/lib/api'

type SubscriptionsResponse = Route.Response<'api.v1.subscriptions.index'>

import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'

interface SubscriptionsTableProps {
  status?: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'BLOCKED' | 'CANCELED' | 'PAUSED'
}

type SubscriptionItem = SubscriptionsResponse extends { data: infer T }
  ? T extends Array<infer U>
    ? U
    : never
  : never

const statusConfig: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    icon: React.ReactNode
  }
> = {
  TRIAL: { label: 'Trial', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  ACTIVE: { label: 'Ativa', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
  PAST_DUE: {
    label: 'Atrasada',
    variant: 'destructive',
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  BLOCKED: { label: 'Bloqueada', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  CANCELED: { label: 'Cancelada', variant: 'outline', icon: <XCircle className="h-3 w-3" /> },
  PAUSED: { label: 'Pausada', variant: 'secondary', icon: <Pause className="h-3 w-3" /> },
}

const billingCycleLabels: Record<string, string> = {
  MONTHLY: 'Mensal',
  QUARTERLY: 'Trimestral',
  SEMI_ANNUAL: 'Semestral',
  ANNUAL: 'Anual',
}

export function SubscriptionsTable({ status }: SubscriptionsTableProps) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(
    api.api.v1.subscriptions.index.queryOptions({ query: { status } })
  )
  const cancelMutation = useMutation(api.api.v1.subscriptions.cancel.mutationOptions())
  const pauseMutation = useMutation(api.api.v1.subscriptions.pause.mutationOptions())
  const reactivateMutation = useMutation(api.api.v1.subscriptions.reactivate.mutationOptions())

  const subscriptions = data?.data ?? []
  const pastDueCount = subscriptions.filter(
    (subscription) => subscription.status === 'PAST_DUE'
  ).length

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const handlePause = async (id: string) => {
    try {
      await pauseMutation.mutateAsync({ params: { id } })
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    } catch {}
  }

  const handleCancel = async (id: string) => {
    try {
      await cancelMutation.mutateAsync({ params: { id } })
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    } catch {}
  }

  const handleReactivate = async (id: string) => {
    try {
      await reactivateMutation.mutateAsync({ params: { id } })
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    } catch {}
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Carregando assinaturas...
        </CardContent>
      </Card>
    )
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma assinatura encontrada</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            As assinaturas das escolas aparecerão aqui
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assinaturas</CardTitle>
        <CardDescription>{subscriptions.length} assinatura(s)</CardDescription>
        {pastDueCount > 0 && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {pastDueCount} assinatura(s) inadimplente(s) com falha de cobrança automática.
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Escola/Rede</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Ciclo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-center">Alunos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Falha Cobrança</TableHead>
              <TableHead>Próx. Cobrança</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((subscription: SubscriptionItem) => {
              const config = statusConfig[subscription.status] || statusConfig.ACTIVE

              return (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {subscription.school?.name || subscription.schoolChain?.name || '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{subscription.plan?.name || 'Custom'}</Badge>
                  </TableCell>
                  <TableCell>
                    {billingCycleLabels[subscription.billingCycle] || subscription.billingCycle}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(subscription.monthlyAmount)}
                  </TableCell>
                  <TableCell className="text-center">{subscription.activeStudents}</TableCell>
                  <TableCell>
                    <Badge variant={config.variant} className="gap-1">
                      {config.icon}
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {subscription.invoices?.[0]?.lastChargeError ? (
                      <span
                        className="inline-flex max-w-[240px] cursor-help items-center truncate text-xs text-red-700"
                        title={subscription.invoices[0].lastChargeError}
                      >
                        {subscription.invoices[0].lastChargeError}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {subscription.currentPeriodEnd
                      ? format(new Date(subscription.currentPeriodEnd), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Ver Faturas</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {subscription.status === 'ACTIVE' && (
                          <>
                            <DropdownMenuItem onClick={() => handlePause(subscription.id)}>
                              <Pause className="h-4 w-4 mr-2" />
                              Pausar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleCancel(subscription.id)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancelar
                            </DropdownMenuItem>
                          </>
                        )}
                        {(subscription.status === 'PAUSED' ||
                          subscription.status === 'CANCELED') && (
                          <DropdownMenuItem onClick={() => handleReactivate(subscription.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Reativar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
