import { useSuspenseQuery } from '@tanstack/react-query'
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

import { useSubscriptionsQueryOptions } from '../../hooks/queries/use_subscriptions'
import {
  useCancelSubscription,
  usePauseSubscription,
  useReactivateSubscription,
} from '../../hooks/mutations/use_subscription_mutations'

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
  status?: string
}

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }
> = {
  TRIAL: { label: 'Trial', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  ACTIVE: { label: 'Ativa', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
  PAST_DUE: { label: 'Atrasada', variant: 'destructive', icon: <AlertTriangle className="h-3 w-3" /> },
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
  const { data } = useSuspenseQuery(useSubscriptionsQueryOptions({ status }))
  const cancelMutation = useCancelSubscription()
  const pauseMutation = usePauseSubscription()
  const reactivateMutation = useReactivateSubscription()

  const subscriptions = Array.isArray(data) ? data : data?.data || []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
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
              <TableHead>Próx. Cobrança</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((subscription: any) => {
              const config = statusConfig[subscription.status] || statusConfig.ACTIVE

              return (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {subscription.school?.name ||
                          subscription.schoolChain?.name ||
                          '-'}
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
                            <DropdownMenuItem
                              onClick={() => pauseMutation.mutate(subscription.id)}
                            >
                              <Pause className="h-4 w-4 mr-2" />
                              Pausar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => cancelMutation.mutate(subscription.id)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancelar
                            </DropdownMenuItem>
                          </>
                        )}
                        {(subscription.status === 'PAUSED' ||
                          subscription.status === 'CANCELED') && (
                          <DropdownMenuItem
                            onClick={() => reactivateMutation.mutate(subscription.id)}
                          >
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
