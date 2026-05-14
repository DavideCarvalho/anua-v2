import { useMutation } from '@tanstack/react-query'
import { Check, X, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { api } from '~/lib/api'

export type AddToolOutputFn = (args: {
  tool: string
  toolCallId: string
  output: unknown
}) => void | Promise<void>

type Props = {
  toolCallId: string
  toolName: string
  input: unknown
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error' | 'output-denied'
  output?: unknown
  addToolOutput: AddToolOutputFn
}

const TOOL_LABELS: Record<string, string> = {
  sendCommunication: 'Enviar comunicado',
  justifyAbsence: 'Justificar falta',
}

function toolLabel(toolName: string): string {
  return TOOL_LABELS[toolName] ?? toolName
}

function formatDateBr(iso: string): string {
  // input já vem como YYYY-MM-DD — formatamos pra dd/mm/yyyy. Fallback
  // pra string crua se não bate.
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  return `${m[3]}/${m[2]}/${m[1]}`
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function isCancelledOutput(output: unknown): output is { cancelled: true; reason?: string } {
  return isObject(output) && output.cancelled === true
}

function isErrorOutput(output: unknown): output is { error: string } {
  return isObject(output) && typeof output.error === 'string'
}

function hasRenderablePayload(output: unknown): output is Record<string, unknown> {
  if (!isObject(output)) return false
  const keys = Object.keys(output)
  if (keys.length === 0) return false
  // Sentinelas: cancelled / error já são tratados acima — qualquer outra
  // forma com chaves entra aqui.
  return true
}

function renderInputSummary(toolName: string, input: unknown) {
  if (toolName === 'justifyAbsence' && isObject(input)) {
    const date = typeof input.date === 'string' ? input.date : null
    const reason = typeof input.reason === 'string' ? input.reason : null
    return (
      <div className="space-y-2.5 text-foreground">
        {date ? (
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Data
            </div>
            <div className="text-sm font-medium">{formatDateBr(date)}</div>
          </div>
        ) : null}
        {reason ? (
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Motivo
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{reason}</div>
          </div>
        ) : null}
      </div>
    )
  }

  if (toolName === 'sendCommunication' && isObject(input)) {
    const title = typeof input.title === 'string' ? input.title : null
    const body = typeof input.body === 'string' ? input.body : null
    const audience = isObject(input.audience) ? input.audience : null
    const scopeType =
      audience && typeof audience.scopeType === 'string' ? audience.scopeType : null
    const requiresAck = input.requiresAcknowledgement === true
    const audienceLabel = scopeType
      ? scopeType === 'SCHOOL'
        ? 'Toda a escola'
        : scopeType === 'CLASS'
          ? 'Uma turma específica'
          : 'Um nível específico'
      : 'Público não definido'

    return (
      <div className="space-y-2.5 text-foreground">
        {title ? (
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Título
            </div>
            <div className="text-sm font-medium">{title}</div>
          </div>
        ) : null}
        {body ? (
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Mensagem
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{body}</div>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">Para:</span> {audienceLabel}
          </span>
          {requiresAck ? <span>· Exige confirmação de leitura</span> : null}
        </div>
      </div>
    )
  }

  return (
    <pre className="overflow-auto rounded border border-border bg-background p-2 font-mono text-[11px]">
      {JSON.stringify(input, null, 2)}
    </pre>
  )
}

export function AiActionApprovalCard(props: Props) {
  const decideMutation = useMutation(api.api.v1.ai.toolCalls.decide.mutationOptions())

  if (props.state === 'output-available' || props.state === 'output-error' || props.state === 'output-denied') {
    if (isCancelledOutput(props.output)) {
      return (
        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
          <div className="flex items-center gap-2 font-medium text-muted-foreground">
            <X className="h-4 w-4" />
            Ação cancelada: {toolLabel(props.toolName)}
          </div>
        </div>
      )
    }
    if (isErrorOutput(props.output)) {
      return (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <div className="flex items-center gap-2 font-medium text-destructive">
            <AlertCircle className="h-4 w-4" />
            {toolLabel(props.toolName)} falhou
          </div>
          <div className="mt-1 text-xs text-destructive/80">{props.output.error}</div>
        </div>
      )
    }
    return (
      <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-sm">
        <div className="flex items-center gap-2 font-medium text-green-700 dark:text-green-400">
          <Check className="h-4 w-4" strokeWidth={3} />
          {toolLabel(props.toolName)} concluído
        </div>
        {hasRenderablePayload(props.output) ? (
          <pre className="mt-2 max-h-48 overflow-auto rounded border border-border bg-background p-2 font-mono text-[10px] text-foreground">
            {JSON.stringify(props.output, null, 2)}
          </pre>
        ) : null}
      </div>
    )
  }

  const busy = decideMutation.isPending

  async function send(decision: 'approve' | 'reject') {
    const result = await decideMutation
      .mutateAsync({
        params: { toolCallId: props.toolCallId },
        body: { decision },
      })
      .catch((err: Error) => ({
        status: 'failed' as const,
        output: null,
        error: err.message,
      }))

    const payload =
      decision === 'reject'
        ? { cancelled: true, reason: 'user declined' }
        : result.status === 'executed'
          ? (result.output ?? { ok: true })
          : { error: result.error ?? 'Falha ao executar a ação' }

    await props.addToolOutput({
      tool: props.toolName,
      toolCallId: props.toolCallId,
      output: payload,
    })
  }

  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
        <AlertCircle className="h-4 w-4" />
        Aprovar ação: {toolLabel(props.toolName)}
      </div>
      <div className="rounded border border-border bg-background p-3">
        {renderInputSummary(props.toolName, props.input)}
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => send('reject')}
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Cancelar
        </Button>
        <Button type="button" size="sm" disabled={busy} onClick={() => send('approve')}>
          {busy ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="mr-1 h-3.5 w-3.5" strokeWidth={3} />
          )}
          {busy ? 'Enviando…' : 'Confirmar e enviar'}
        </Button>
      </div>
    </div>
  )
}
