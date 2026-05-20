import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import type { ToolUIPart } from 'ai'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { DatePicker } from '../ui/date-picker'
import { cn } from '../../lib/utils'
import { api } from '~/lib/api'

type CreateAssignmentFields = {
  name: string | null
  description: string | null
  dueDate: string | null
  maxGrade: number | null
  classId: string | null
  subjectId: string | null
}

const EMPTY_FIELDS: CreateAssignmentFields = {
  name: null,
  description: null,
  dueDate: null,
  maxGrade: null,
  classId: null,
  subjectId: null,
}

function fieldsFromInput(input: unknown): CreateAssignmentFields {
  if (typeof input !== 'object' || input === null) return EMPTY_FIELDS
  const obj = input as Record<string, unknown>
  return {
    name: typeof obj.name === 'string' ? obj.name : null,
    description: typeof obj.description === 'string' ? obj.description : null,
    dueDate: typeof obj.dueDate === 'string' ? obj.dueDate : null,
    maxGrade: typeof obj.maxGrade === 'number' ? obj.maxGrade : null,
    classId: typeof obj.classId === 'string' ? obj.classId : null,
    subjectId: typeof obj.subjectId === 'string' ? obj.subjectId : null,
  }
}

function dateToYMD(date: Date | undefined): string | null {
  if (!date) return null
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function ymdToDate(s: string | null): Date | undefined {
  if (!s) return undefined
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return undefined
  const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(dt.getTime()) ? undefined : dt
}

type Props = {
  threadId: string
  toolPart: ToolUIPart
  onClose: () => void
}

export function CreateAssignmentCanvas({ threadId, toolPart, onClose }: Props) {
  const incoming = useMemo(() => fieldsFromInput(toolPart.input), [toolPart.input])
  const [fields, setFields] = useState<CreateAssignmentFields>(incoming)
  const [submitState, setSubmitState] = useState<
    { kind: 'idle' } | { kind: 'success'; assignmentId: string } | { kind: 'error'; error: string }
  >({ kind: 'idle' })

  // Sincronizamos com `incoming` toda vez que o CONTEÚDO do input do
  // toolPart muda. O Vercel AI SDK MANTÉM o mesmo toolCallId durante o
  // streaming (state vai de input-streaming → input-available), só o
  // input que cresce — usar toolCallId como trigger não pega esses updates.
  // Comparamos via JSON.stringify pra evitar loop infinito (a cada render
  // useMemo cria novo obj de incoming, mas string fica igual quando shape
  // não muda). Sharp edge documentado: sobrescreve edição manual do user
  // (v1; v2 thread o estado do canvas pro backend).
  const incomingKey = useMemo(() => JSON.stringify(incoming), [incoming])
  const incomingRef = useRef(incoming)
  incomingRef.current = incoming
  useEffect(() => {
    setFields(incomingRef.current)
    setSubmitState({ kind: 'idle' })
  }, [incomingKey])

  // Resolve classId em nome pra exibição.
  const idsForResolve = useMemo(
    () => ({ classIds: fields.classId ? [fields.classId] : [] }),
    [fields.classId]
  )
  const { data: resolved } = useQuery({
    queryKey: ['ai', 'resolve-names', idsForResolve],
    queryFn: async () => {
      const res = await fetch('/api/v1/ai/resolve-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify(idsForResolve),
      })
      if (!res.ok) return { classes: {} as Record<string, { id: string; name: string }> }
      const json: unknown = await res.json()
      const classes =
        typeof json === 'object' && json !== null && 'classes' in json
          ? (json as { classes: Record<string, { id: string; name: string }> }).classes
          : {}
      return { classes }
    },
    enabled: !!fields.classId,
    staleTime: 0,
    refetchOnMount: 'always',
  })
  const className = fields.classId ? resolved?.classes?.[fields.classId]?.name ?? null : null

  const queryClient = useQueryClient()
  const submitMutation = useMutation(api.api.v1.ai.canvas.submit.mutationOptions())

  function setField<K extends keyof CreateAssignmentFields>(
    key: K,
    value: CreateAssignmentFields[K]
  ) {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (submitState.kind !== 'idle') setSubmitState({ kind: 'idle' })
  }

  const validationError = (() => {
    if (!fields.name || fields.name.trim().length < 3) {
      return 'Dê um nome de pelo menos 3 caracteres.'
    }
    if (!fields.dueDate) return 'Defina a data de entrega.'
    if (!fields.classId) return 'Selecione a turma pela IA antes de criar.'
    if (fields.maxGrade !== null && (fields.maxGrade < 0 || fields.maxGrade > 100)) {
      return 'Nota máxima deve estar entre 0 e 100.'
    }
    return null
  })()

  async function handleSubmit() {
    if (validationError) return
    try {
      const result = await submitMutation.mutateAsync({
        body: {
          threadId,
          toolName: 'createAssignment',
          fields: {
            name: fields.name,
            description: fields.description ?? null,
            dueDate: fields.dueDate,
            maxGrade: fields.maxGrade ?? null,
            classId: fields.classId,
            subjectId: fields.subjectId ?? null,
          },
        },
      })
      const output = (result as { output?: { assignmentId?: string } }).output
      const assignmentId = typeof output?.assignmentId === 'string' ? output.assignmentId : ''
      setSubmitState({ kind: 'success', assignmentId })
      await queryClient.invalidateQueries({
        queryKey: api.api.v1.ai.threads.show.queryOptions({ params: { id: threadId } }).queryKey,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao criar atividade'
      setSubmitState({ kind: 'error', error: message })
    }
  }

  const isSubmitting = submitMutation.isPending

  const isSuccess = submitState.kind === 'success'
  // No success a gente trava o form (read-only) mas mantém os valores visíveis
  // pro professor conferir o que acabou de criar antes de fechar.
  const disabled = isSubmitting || isSuccess

  return (
    <div className="space-y-3 px-3 py-3">
      {isSuccess && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Atividade criada com sucesso!
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="canvas-name">Nome da atividade</Label>
        <Input
          id="canvas-name"
          value={fields.name ?? ''}
          disabled={disabled}
          onChange={(e) => setField('name', e.target.value || null)}
          placeholder="Ex: Lista de exercícios cap. 4"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="canvas-desc">Descrição</Label>
        <Textarea
          id="canvas-desc"
          value={fields.description ?? ''}
          disabled={disabled}
          onChange={(e) => setField('description', e.target.value || null)}
          rows={3}
          placeholder="Instruções pros alunos (opcional)"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="canvas-due">Prazo</Label>
          <DatePicker
            date={ymdToDate(fields.dueDate)}
            disabled={disabled}
            onChange={(d) => setField('dueDate', dateToYMD(d))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="canvas-grade">Nota máxima</Label>
          <Input
            id="canvas-grade"
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={fields.maxGrade ?? ''}
            disabled={disabled}
            onChange={(e) => {
              const v = e.target.value
              setField('maxGrade', v === '' ? null : Number(v))
            }}
            placeholder="Ex: 10"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Turma</Label>
        <div
          className={cn(
            'rounded-md border border-input bg-muted/40 px-3 py-2 text-sm',
            !fields.classId && 'text-muted-foreground'
          )}
        >
          {className ?? (fields.classId ? 'Resolvendo…' : 'Peça à IA pra escolher a turma')}
        </div>
      </div>

      {!isSuccess && validationError && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {validationError}
        </div>
      )}
      {submitState.kind === 'error' && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {submitState.error}
        </div>
      )}

      {isSuccess ? (
        <Button onClick={onClose} className="w-full" variant="outline">
          Fechar
        </Button>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={!!validationError || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando…
            </>
          ) : (
            'Criar atividade'
          )}
        </Button>
      )}
    </div>
  )
}
