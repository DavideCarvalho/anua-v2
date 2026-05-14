import { Head } from '@inertiajs/react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, ExternalLink, ShieldAlert } from 'lucide-react'
import { DateTime } from 'luxon'
import { AdminLayout } from '../../../components/layouts'
import { Card, CardContent } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import { api } from '../../../lib/api'

const PAGE_SIZE = 50

type Status =
  | 'auto_executed'
  | 'pending_approval'
  | 'executing'
  | 'executed'
  | 'rejected'
  | 'failed'

const STATUS_BADGE: Record<
  Status,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost' }
> = {
  auto_executed: { label: 'Auto', variant: 'secondary' },
  pending_approval: { label: 'Aguardando', variant: 'outline' },
  executing: { label: 'Executando', variant: 'outline' },
  executed: { label: 'Aprovado', variant: 'default' },
  rejected: { label: 'Rejeitado', variant: 'secondary' },
  failed: { label: 'Falhou', variant: 'destructive' },
}

type AuditRow = {
  id: string
  toolName: string
  toolKind: string
  status: Status
  input: unknown
  output: unknown
  error: string | null
  executionMs: number | null
  createdAt: string
  user: { id: string; name: string | null } | null
  thread: { id: string; title: string | null; channel: string } | null
  message: { id: string } | null
}

function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_BADGE[status]
  return <Badge variant={s.variant}>{s.label}</Badge>
}

function prettyJson(value: unknown): string {
  if (value === null || value === undefined) return '(vazio)'
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function formatExecutionMs(ms: number | null): string {
  if (ms === null) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function AuditRowItem({ row }: { row: AuditRow }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <TableRow>
        <TableCell className="w-8 p-1">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="cursor-pointer text-muted-foreground hover:text-foreground"
            aria-label={open ? 'Fechar' : 'Abrir'}
          >
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </TableCell>
        <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground text-xs">
          {DateTime.fromISO(row.createdAt).toFormat('dd/MM HH:mm:ss')}
        </TableCell>
        <TableCell className="text-xs">
          {row.user ? (
            <span>{row.user.name ?? row.user.id.slice(0, 8)}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell>
          <code className="font-mono text-xs">{row.toolName}</code>
        </TableCell>
        <TableCell className="text-xs uppercase text-muted-foreground">{row.toolKind}</TableCell>
        <TableCell>
          <StatusBadge status={row.status} />
        </TableCell>
        <TableCell className="text-right tabular-nums text-muted-foreground text-xs">
          {formatExecutionMs(row.executionMs)}
        </TableCell>
        <TableCell className="text-xs">
          {row.thread ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="max-w-[200px] truncate">
                {row.thread.title ?? 'Sem título'}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase">
                {row.thread.channel}
              </Badge>
              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
      </TableRow>
      {open ? (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableCell />
          <TableCell colSpan={7} className="px-3 py-3">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="mb-1 font-medium uppercase tracking-wide text-muted-foreground">
                  Input
                </div>
                <pre className="max-h-64 overflow-auto rounded border border-border bg-background p-2 font-mono text-[11px]">
                  {prettyJson(row.input)}
                </pre>
              </div>
              <div>
                <div className="mb-1 font-medium uppercase tracking-wide text-muted-foreground">
                  {row.error ? 'Erro' : 'Output'}
                </div>
                <pre className="max-h-64 overflow-auto rounded border border-border bg-background p-2 font-mono text-[11px]">
                  {row.error ?? prettyJson(row.output)}
                </pre>
              </div>
            </div>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  )
}

export default function AiAuditPage() {
  const [page, setPage] = useState(0)
  const [kindFilter, setKindFilter] = useState<'all' | 'read' | 'action'>('all')

  const { data, isLoading, error, isFetching } = useQuery(
    api.api.v1.admin.ai.toolCalls.queryOptions({
      query: {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        ...(kindFilter !== 'all' ? { toolKind: kindFilter } : {}),
      },
    })
  )

  const rows = (data?.rows ?? []) as AuditRow[]
  const total = data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <AdminLayout>
      <Head title="Auditoria de IA" />

      <div className="space-y-6">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <ShieldAlert className="h-6 w-6 text-primary" />
              Auditoria de IA
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Histórico de toda chamada de tool feita pelo assistente. Esta
              tela é só leitura — a aprovação de tools de escrita acontece
              no próprio chat de quem fez o pedido.
            </p>
          </div>
          <div className="text-xs tabular-nums text-muted-foreground">{total} chamadas</div>
        </div>

        <div className="flex gap-2">
          {(['all', 'read', 'action'] as const).map((opt) => (
            <Button
              key={opt}
              variant={kindFilter === opt ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setKindFilter(opt)
                setPage(0)
              }}
            >
              {opt === 'all' ? 'Todas' : opt === 'read' ? 'Leitura' : 'Escrita'}
            </Button>
          ))}
        </div>

        {isLoading && (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        )}

        {error ? (
          <Card>
            <CardContent className="p-4 text-sm text-destructive">
              Falha ao carregar o log de auditoria.
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !error && rows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Nenhuma chamada registrada ainda. Toda vez que o assistente usar
              uma tool, ela aparece aqui.
            </CardContent>
          </Card>
        ) : null}

        {rows.length > 0 ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Quando</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tool</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Duração</TableHead>
                  <TableHead>Thread</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <AuditRowItem key={row.id} row={row} />
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : null}

        {pageCount > 1 ? (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Página {page + 1} de {pageCount}
              {isFetching ? ' · carregando…' : ''}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={page + 1 >= pageCount}
              >
                Próxima
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  )
}
