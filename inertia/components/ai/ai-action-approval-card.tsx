import { useMutation, useQuery } from '@tanstack/react-query'
import { Check, X, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { api } from '~/lib/api'

type ResolvedNames = {
  students: Record<string, { id: string; name: string }>
  exams: Record<string, { id: string; name: string; subjectName: string | null }>
  classes: Record<string, { id: string; name: string; levelName: string | null }>
}

const EMPTY_NAMES: ResolvedNames = { students: {}, exams: {}, classes: {} }

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

// Extrai IDs do input que precisam ser resolvidos pra nome, por tool. As
// listas estão em sync com o que cada renderInputSummary consome.
function idsToResolve(toolName: string, input: unknown): {
  studentIds: string[]
  examIds: string[]
  classIds: string[]
} {
  const studentIds = new Set<string>()
  const examIds = new Set<string>()
  const classIds = new Set<string>()

  if (!isObject(input)) {
    return { studentIds: [], examIds: [], classIds: [] }
  }

  if (toolName === 'justifyAbsence') {
    if (typeof input.studentId === 'string') studentIds.add(input.studentId)
  }
  if (toolName === 'enterExamGrade') {
    if (typeof input.studentId === 'string') studentIds.add(input.studentId)
    if (typeof input.examId === 'string') examIds.add(input.examId)
  }
  if (toolName === 'registerAttendance') {
    if (typeof input.classId === 'string') classIds.add(input.classId)
    if (isStringArray(input.absentStudentIds)) {
      for (const id of input.absentStudentIds) studentIds.add(id)
    }
    if (isStringArray(input.lateStudentIds)) {
      for (const id of input.lateStudentIds) studentIds.add(id)
    }
  }
  if (toolName === 'sendCommunication') {
    // Quando o público é uma turma específica, resolvemos pra mostrar o nome.
    const audience = isObject(input.audience) ? input.audience : null
    if (
      audience &&
      audience.scopeType === 'CLASS' &&
      typeof audience.scopeId === 'string'
    ) {
      classIds.add(audience.scopeId)
    }
  }

  return {
    studentIds: Array.from(studentIds),
    examIds: Array.from(examIds),
    classIds: Array.from(classIds),
  }
}

// PromiseLike, não Promise — o tipo do useChat do SDK retorna assim, e
// estreitar pra Promise<void> quebra a passagem direta entre o ChatPane e
// o card.
export type AddToolOutputFn = (args: {
  tool: string
  toolCallId: string
  output: unknown
}) => void | PromiseLike<void>

type Props = {
  toolCallId: string
  toolName: string
  input: unknown
  // O ToolUIPart['state'] do SDK inclui também 'approval-requested' e
  // 'approval-responded'. Não usamos esses branches aqui, mas aceitamos pra
  // não exigir narrowing no caller.
  state:
    | 'input-streaming'
    | 'input-available'
    | 'output-available'
    | 'output-error'
    | 'output-denied'
    | 'approval-requested'
    | 'approval-responded'
  output?: unknown
  addToolOutput: AddToolOutputFn
}

const TOOL_LABELS: Record<string, string> = {
  sendCommunication: 'Enviar comunicado',
  justifyAbsence: 'Justificar falta',
  enterExamGrade: 'Lançar nota de prova',
  registerAttendance: 'Registrar presença',
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

// Helper pra montar string "Aluno: João Silva" quando temos a resolução, ou
// "Aluno: 019c..." (8 chars do uuid) com aviso de não-resolvido quando não.
function studentName(id: string | undefined, names: ResolvedNames): string {
  if (!id) return '—'
  const r = names.students[id]
  return r ? r.name : `${id.slice(0, 8)}… (sem acesso ao nome)`
}

function examName(id: string | undefined, names: ResolvedNames): string {
  if (!id) return '—'
  const r = names.exams[id]
  if (!r) return `${id.slice(0, 8)}… (sem acesso ao nome)`
  return r.subjectName ? `${r.name} · ${r.subjectName}` : r.name
}

function className(id: string | undefined, names: ResolvedNames): string {
  if (!id) return '—'
  const r = names.classes[id]
  if (!r) return `${id.slice(0, 8)}… (sem acesso ao nome)`
  return r.levelName ? `${r.name} · ${r.levelName}` : r.name
}

function renderInputSummary(toolName: string, input: unknown, names: ResolvedNames) {
  if (toolName === 'registerAttendance' && isObject(input)) {
    const date = typeof input.date === 'string' ? input.date : null
    const classId = typeof input.classId === 'string' ? input.classId : undefined
    const absent = isStringArray(input.absentStudentIds) ? input.absentStudentIds : []
    const late = isStringArray(input.lateStudentIds) ? input.lateStudentIds : []
    return (
      <div className="space-y-2.5 text-foreground">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Turma
          </div>
          <div className="text-sm font-medium">{className(classId, names)}</div>
        </div>
        {date ? (
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Data
            </div>
            <div className="text-sm font-medium">{formatDateBr(date)}</div>
          </div>
        ) : null}
        {absent.length > 0 ? (
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {absent.length} falta{absent.length === 1 ? '' : 's'}
            </div>
            <ul className="list-disc pl-4 text-sm leading-relaxed">
              {absent.map((id) => (
                <li key={id}>{studentName(id, names)}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">Ninguém faltou.</div>
        )}
        {late.length > 0 ? (
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {late.length} atrasado{late.length === 1 ? '' : 's'}
            </div>
            <ul className="list-disc pl-4 text-sm leading-relaxed">
              {late.map((id) => (
                <li key={id}>{studentName(id, names)}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="text-[10px] text-muted-foreground">
          Demais alunos serão marcados como presentes. Se você tem mais de uma aula
          nessa turma no dia, o registro vai pra primeira ainda não preenchida.
        </div>
      </div>
    )
  }

  if (toolName === 'enterExamGrade' && isObject(input)) {
    const studentId = typeof input.studentId === 'string' ? input.studentId : undefined
    const examId = typeof input.examId === 'string' ? input.examId : undefined
    const score = typeof input.score === 'number' ? input.score : null
    const absent = input.absent === true
    const feedback = typeof input.feedback === 'string' ? input.feedback : null
    return (
      <div className="space-y-2.5 text-foreground">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Aluno
          </div>
          <div className="text-sm font-medium">{studentName(studentId, names)}</div>
        </div>
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Prova
          </div>
          <div className="text-sm font-medium">{examName(examId, names)}</div>
        </div>
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Nota
          </div>
          <div className="text-sm font-medium">
            {absent ? 'Faltou (sem nota)' : score !== null ? score.toLocaleString('pt-BR') : '—'}
          </div>
        </div>
        {feedback ? (
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Comentário
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{feedback}</div>
          </div>
        ) : null}
      </div>
    )
  }

  if (toolName === 'justifyAbsence' && isObject(input)) {
    const studentId = typeof input.studentId === 'string' ? input.studentId : undefined
    const date = typeof input.date === 'string' ? input.date : null
    const reason = typeof input.reason === 'string' ? input.reason : null
    return (
      <div className="space-y-2.5 text-foreground">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Aluno
          </div>
          <div className="text-sm font-medium">{studentName(studentId, names)}</div>
        </div>
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
    const scopeId =
      audience && typeof audience.scopeId === 'string' ? audience.scopeId : undefined
    const requiresAck = input.requiresAcknowledgement === true
    const audienceLabel = scopeType
      ? scopeType === 'SCHOOL'
        ? 'Toda a escola'
        : scopeType === 'CLASS'
          ? `Turma — ${className(scopeId, names)}`
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

  // Resolve UUIDs do input em nomes (Aluno/Prova/Turma) pro card mostrar
  // "João Silva" em vez de "Nota: 7,5" solto. Filtrado por scope no backend:
  // se o user não tem acesso, o id simplesmente não vem no resultado e o
  // helper exibe "8 chars... (sem acesso ao nome)".
  const idsForCard = idsToResolve(props.toolName, props.input)
  const hasIds =
    idsForCard.studentIds.length > 0 ||
    idsForCard.examIds.length > 0 ||
    idsForCard.classIds.length > 0
  // POST direto via fetch porque Tuyau gera mutationOptions pra POST, não
  // queryOptions — e a gente quer cache automático (não re-buscar a cada
  // re-render do card). useQuery + key estável resolve.
  const { data: resolvedRaw } = useQuery({
    queryKey: ['ai', 'resolve-names', idsForCard],
    queryFn: async (): Promise<ResolvedNames> => {
      const res = await fetch('/api/v1/ai/resolve-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify(idsForCard),
      })
      if (!res.ok) return EMPTY_NAMES
      const json = await res.json()
      if (!isObject(json)) return EMPTY_NAMES
      return {
        students: isObject(json.students) ? (json.students as ResolvedNames['students']) : {},
        exams: isObject(json.exams) ? (json.exams as ResolvedNames['exams']) : {},
        classes: isObject(json.classes) ? (json.classes as ResolvedNames['classes']) : {},
      }
    },
    enabled: hasIds,
    staleTime: 60_000,
  })
  const names: ResolvedNames = resolvedRaw ?? EMPTY_NAMES

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

    // Result vem como union de Tuyau (200/400/404/409 + nosso fallback do catch).
    // Só o 200 success tem `output`; o resto tem `message` ou `error`. Narrow
    // antes de montar o payload em vez de assumir o shape.
    const extractError = (r: typeof result): string => {
      if ('error' in r && typeof r.error === 'string') return r.error
      if ('message' in r && typeof r.message === 'string') return r.message
      return 'Falha ao executar a ação'
    }
    const payload =
      decision === 'reject'
        ? { cancelled: true, reason: 'user declined' }
        : 'status' in result && result.status === 'executed'
          ? ('output' in result ? (result.output ?? { ok: true }) : { ok: true })
          : { error: extractError(result) }

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
        {renderInputSummary(props.toolName, props.input, names)}
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
