import { Link } from '@adonisjs/inertia/react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Loader2 } from 'lucide-react'
import type { Route } from '@tuyau/core/types'

import { buttonVariants, Button } from '~/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Badge } from '~/components/ui/badge'
import { cn, formatCurrency } from '~/lib/utils'
import { api } from '~/lib/api'

import { PedagogicalAlertSheet, type PedagogicalAlerts } from '../pedagogical-alert-sheet'
import type { AttentionItem } from './types'
import { formatBRL, type EnrollmentFunnel, type OverdueAging } from './use_attention_items'

interface AttentionDrawerProps {
  item: AttentionItem | null
  pedagogicalAlerts: PedagogicalAlerts | undefined
  overdueAging: OverdueAging | undefined
  enrollmentFunnel: EnrollmentFunnel | undefined
  onOpenChange: (open: boolean) => void
}

export function AttentionDrawer({
  item,
  pedagogicalAlerts,
  overdueAging,
  enrollmentFunnel,
  onOpenChange,
}: AttentionDrawerProps) {
  if (!item) return null

  if (item.pedagogicalAlertKey && pedagogicalAlerts) {
    return (
      <PedagogicalAlertSheet
        alertKey={item.pedagogicalAlertKey}
        alerts={pedagogicalAlerts}
        open={true}
        onOpenChange={onOpenChange}
      />
    )
  }

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{item.title}</SheetTitle>
          {item.subtitle ? <SheetDescription>{item.subtitle}</SheetDescription> : null}
        </SheetHeader>

        <div className="mt-6">
          {item.category === 'financial' ? <FinancialOverdueDetail aging={overdueAging} /> : null}
          {item.category === 'enrollment' && enrollmentFunnel ? (
            <EnrollmentFunnelBreakdown funnel={enrollmentFunnel} highlightItemId={item.id} />
          ) : null}
        </div>

        <SheetFooter className="mt-6 flex-row justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {item.route ? (
            <Link
              route={item.route}
              onClick={() => onOpenChange(false)}
              className={cn(buttonVariants({ variant: 'default' }), 'gap-2')}
            >
              Abrir página de {item.destinationLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

type StudentPaymentsResponse = Route.Response<'api.v1.student_payments.index'>
type OverduePayment = StudentPaymentsResponse['data'][number]

type AgingBucket = '0-30' | '31-60' | '61+'

const BUCKET_LABEL: Record<AgingBucket, string> = {
  '0-30': 'Até 30 dias',
  '31-60': '31 a 60 dias',
  '61+': 'Mais de 60 dias',
}

const BUCKET_ORDER: AgingBucket[] = ['61+', '31-60', '0-30']

function bucketFromDays(days: number): AgingBucket {
  if (days > 60) return '61+'
  if (days > 30) return '31-60'
  return '0-30'
}

function daysOverdue(dueDate: string | null | undefined): number {
  if (!dueDate) return 0
  const due = new Date(dueDate)
  const today = new Date()
  return Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)))
}

function formatDueDate(dueDate: string | null | undefined): string {
  if (!dueDate) return '-'
  return new Date(dueDate).toLocaleDateString('pt-BR')
}

interface FinancialOverdueDetailProps {
  aging: OverdueAging | undefined
}

function FinancialOverdueDetail({ aging }: FinancialOverdueDetailProps) {
  const { data, isLoading, error } = useQuery(
    api.api.v1.studentPayments.index.queryOptions({
      query: { status: 'OVERDUE', limit: 100, page: 1 },
    })
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando faturas vencidas...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as faturas vencidas.
      </div>
    )
  }

  const payments = data?.data ?? []
  const meta = data?.metadata

  const grouped: Record<AgingBucket, OverduePayment[]> = {
    '0-30': [],
    '31-60': [],
    '61+': [],
  }
  for (const payment of payments) {
    const days = daysOverdue(payment.dueDate)
    grouped[bucketFromDays(days)].push(payment)
  }

  for (const bucket of BUCKET_ORDER) {
    grouped[bucket].sort((a, b) => daysOverdue(b.dueDate) - daysOverdue(a.dueDate))
  }

  const totalLoaded = payments.length
  // metadata is inferred via Tuyau as SimplePaginatorMetaKeys (keys-as-strings),
  // but runtime values are numeric — coerce defensively.
  const metaTotal = meta?.total === undefined ? undefined : Number(meta.total)
  const totalKnown = aging?.totalCount ?? metaTotal ?? totalLoaded
  const hasMore = totalKnown > totalLoaded

  const buckets = BUCKET_ORDER.filter((b) => grouped[b].length > 0)
  if (buckets.length === 0) {
    return (
      <div className="rounded-lg bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
        Nenhuma fatura vencida encontrada.
      </div>
    )
  }

  const defaultBucket = buckets[0]

  return (
    <Tabs defaultValue={defaultBucket}>
      <TabsList>
        {buckets.map((bucket) => (
          <TabsTrigger key={bucket} value={bucket} className="gap-2">
            {BUCKET_LABEL[bucket]}
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-medium">
              {grouped[bucket].length}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
      {buckets.map((bucket) => (
        <TabsContent key={bucket} value={bucket} className="mt-4">
          <OverduePaymentsTable payments={grouped[bucket]} />
        </TabsContent>
      ))}
      {hasMore ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Mostrando {totalLoaded} de {totalKnown} faturas vencidas. Veja todas na página de
          inadimplência.
        </p>
      ) : null}
    </Tabs>
  )
}

interface OverduePaymentsTableProps {
  payments: OverduePayment[]
}

function OverduePaymentsTable({ payments }: OverduePaymentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Aluno</TableHead>
          <TableHead>Referência</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-right">Dias em atraso</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => {
          const days = daysOverdue(payment.dueDate)
          const amount = Number(payment.amount ?? 0)
          const studentName = payment.student?.user?.name ?? 'Aluno sem nome'
          const reference = payment.month && payment.year ? `${payment.month}/${payment.year}` : '-'
          return (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">{studentName}</TableCell>
              <TableCell className="text-muted-foreground">{reference}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDueDate(payment.dueDate)}
              </TableCell>
              <TableCell className="text-right tabular-nums font-medium">
                {formatCurrency(amount)}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={days > 60 ? 'destructive' : 'secondary'} className="tabular-nums">
                  {days} {days === 1 ? 'dia' : 'dias'}
                </Badge>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

interface EnrollmentBreakdownProps {
  funnel: EnrollmentFunnel
  highlightItemId: string
}

interface FunnelRow {
  id: string
  label: string
  description: string
  value: number
  itemId: string
}

function EnrollmentFunnelBreakdown({ funnel, highlightItemId }: EnrollmentBreakdownProps) {
  const rows: FunnelRow[] = [
    {
      id: 'total',
      label: 'Total de matrículas',
      description: 'No funil para o período ativo',
      value: funnel.totalEnrollments,
      itemId: '',
    },
    {
      id: 'pendingDocuments',
      label: 'Documentos pendentes',
      description: 'Aguardando revisão da secretaria',
      value: funnel.pendingDocuments,
      itemId: 'enrollment:pending-documents',
    },
    {
      id: 'completed',
      label: 'Matrículas concluídas',
      description: 'Aluno registrado e ativo',
      value: funnel.completed,
      itemId: '',
    },
  ]

  // Silence unused-import warning when this branch isn't taken at build time
  void formatBRL

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Estado atual do funil de matrículas no período ativo. O item destacado é o que você abriu no
        inbox.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Etapa</TableHead>
            <TableHead>O que significa</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const isHighlight = row.itemId !== '' && row.itemId === highlightItemId
            return (
              <TableRow
                key={row.id}
                className={cn(isHighlight && 'bg-muted/60')}
                data-current={isHighlight}
              >
                <TableCell className="font-medium">
                  {row.label}
                  {isHighlight ? (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (selecionado)
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.description}</TableCell>
                <TableCell className="text-right tabular-nums">{row.value}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground">
        Lista de contratos, status detalhado e ações estão na página de contratos.
      </p>
    </div>
  )
}
