import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import type { ToolUIPart } from 'ai'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { api } from '~/lib/api'

/**
 * Painel de lançamento de nota. Aluno/prova vêm do AI (read-only no painel) —
 * o professor só edita score/feedback/falta. Pra trocar aluno ou prova, o user
 * pede pra IA via chat. Submit dispara o handler enterExamGrade do
 * action_dispatcher via /api/v1/ai/canvas/submit.
 */

type EnterExamGradeFields = {
  examId: string | null
  studentId: string | null
  score: number | null
  absent: boolean
  feedback: string | null
}

const EMPTY_FIELDS: EnterExamGradeFields = {
  examId: null,
  studentId: null,
  score: null,
  absent: false,
  feedback: null,
}

function fieldsFromInput(input: unknown): EnterExamGradeFields {
  if (typeof input !== 'object' || input === null) return EMPTY_FIELDS
  const obj = input as Record<string, unknown>
  return {
    examId: typeof obj.examId === 'string' ? obj.examId : null,
    studentId: typeof obj.studentId === 'string' ? obj.studentId : null,
    score: typeof obj.score === 'number' ? obj.score : null,
    absent: obj.absent === true,
    feedback: typeof obj.feedback === 'string' ? obj.feedback : null,
  }
}

type ResolvedNames = {
  students: Record<string, { id: string; name: string }>
  exams: Record<string, { id: string; name: string; subjectName: string | null }>
}

const EMPTY_NAMES: ResolvedNames = { students: {}, exams: {} }

type Props = {
  threadId: string
  toolPart: ToolUIPart
  onClose: () => void
}

export function EnterExamGradeCanvas({ threadId, toolPart, onClose }: Props) {
  const incoming = useMemo(() => fieldsFromInput(toolPart.input), [toolPart.input])
  const [fields, setFields] = useState<EnterExamGradeFields>(incoming)
  const [submitState, setSubmitState] = useState<
    { kind: 'idle' } | { kind: 'success' } | { kind: 'error'; error: string }
  >({ kind: 'idle' })

  // Sincronizamos com `incoming` toda vez que o CONTEÚDO do input muda. Mesmo
  // padrão do AiActionCanvas (createAssignment): comparamos via JSON pra evitar
  // loop e usamos ref pra ler sem precisar declarar deps. Sharp edge:
  // sobrescreve edição manual do user se a IA fizer outra call.
  const incomingKey = useMemo(() => JSON.stringify(incoming), [incoming])
  const incomingRef = useRef(incoming)
  incomingRef.current = incoming
  useEffect(() => {
    setFields(incomingRef.current)
    setSubmitState({ kind: 'idle' })
  }, [incomingKey])

  // Resolve student/exam ids em nomes pra exibição read-only.
  const idsForResolve = useMemo(
    () => ({
      studentIds: fields.studentId ? [fields.studentId] : [],
      examIds: fields.examId ? [fields.examId] : [],
    }),
    [fields.studentId, fields.examId]
  )
  const hasIds = idsForResolve.studentIds.length > 0 || idsForResolve.examIds.length > 0
  const { data: resolved } = useQuery({
    queryKey: ['ai', 'resolve-names', idsForResolve],
    queryFn: async (): Promise<ResolvedNames> => {
      const res = await fetch('/api/v1/ai/resolve-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify(idsForResolve),
      })
      if (!res.ok) return EMPTY_NAMES
      const json = await res.json()
      if (typeof json !== 'object' || json === null) return EMPTY_NAMES
      const j = json as Record<string, unknown>
      return {
        students:
          typeof j.students === 'object' && j.students !== null
            ? (j.students as ResolvedNames['students'])
            : {},
        exams:
          typeof j.exams === 'object' && j.exams !== null
            ? (j.exams as ResolvedNames['exams'])
            : {},
      }
    },
    enabled: hasIds,
    staleTime: 0,
    refetchOnMount: 'always',
  })
  const names = resolved ?? EMPTY_NAMES
  const studentLabel = fields.studentId
    ? names.students[fields.studentId]?.name ?? null
    : null
  const examLabel = fields.examId
    ? (() => {
        const exam = names.exams[fields.examId]
        if (!exam) return null
        return exam.subjectName ? `${exam.name} · ${exam.subjectName}` : exam.name
      })()
    : null

  const queryClient = useQueryClient()
  const submitMutation = useMutation(api.api.v1.ai.canvas.submit.mutationOptions())

  function setField<K extends keyof EnterExamGradeFields>(
    key: K,
    value: EnterExamGradeFields[K]
  ) {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (submitState.kind !== 'idle') setSubmitState({ kind: 'idle' })
  }

  const validationError = (() => {
    if (!fields.examId) return 'A IA precisa indicar a prova antes de lançar.'
    if (!fields.studentId) return 'A IA precisa indicar o aluno antes de lançar.'
    if (fields.absent) {
      // OK — score deve ser null nesse caso. Aceita.
      return null
    }
    if (fields.score === null) return 'Digite a nota (ou marque "Aluno faltou").'
    if (fields.score < 0 || fields.score > 100) return 'Nota deve estar entre 0 e 100.'
    return null
  })()

  async function handleSubmit() {
    if (validationError) return
    try {
      await submitMutation.mutateAsync({
        body: {
          threadId,
          toolName: 'enterExamGrade',
          fields: {
            examId: fields.examId,
            studentId: fields.studentId,
            score: fields.absent ? null : fields.score,
            absent: fields.absent,
            feedback: fields.feedback ?? null,
          },
        },
      })
      setSubmitState({ kind: 'success' })
      await queryClient.invalidateQueries({
        queryKey: api.api.v1.ai.threads.show.queryOptions({ params: { id: threadId } }).queryKey,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao lançar nota'
      setSubmitState({ kind: 'error', error: message })
    }
  }

  const isSubmitting = submitMutation.isPending

  if (submitState.kind === 'success') {
    return (
      <div className="space-y-3 px-3 py-4">
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Nota lançada com sucesso!
        </div>
        <Button onClick={onClose} className="w-full">
          Fechar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3 px-3 py-3">
      <div className="space-y-1">
        <Label>Aluno</Label>
        <div className="rounded-md border border-input bg-muted/40 px-3 py-2 text-sm">
          {studentLabel ?? (fields.studentId ? 'Resolvendo…' : 'Peça à IA pra escolher o aluno')}
        </div>
      </div>

      <div className="space-y-1">
        <Label>Prova</Label>
        <div className="rounded-md border border-input bg-muted/40 px-3 py-2 text-sm">
          {examLabel ?? (fields.examId ? 'Resolvendo…' : 'Peça à IA pra escolher a prova')}
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
        <Checkbox
          id="canvas-absent"
          checked={fields.absent}
          onCheckedChange={(checked) => {
            const value = checked === true
            setFields((prev) => ({
              ...prev,
              absent: value,
              // Quando marca falta, zera o score; quando desmarca, deixa pro
              // user digitar de novo.
              score: value ? null : prev.score,
            }))
            if (submitState.kind !== 'idle') setSubmitState({ kind: 'idle' })
          }}
        />
        <Label htmlFor="canvas-absent" className="cursor-pointer text-sm font-normal">
          Aluno faltou (sem nota)
        </Label>
      </div>

      <div className="space-y-1">
        <Label htmlFor="canvas-score">Nota</Label>
        <Input
          id="canvas-score"
          type="number"
          min={0}
          max={100}
          step={0.5}
          value={fields.score ?? ''}
          disabled={fields.absent}
          onChange={(e) => {
            const v = e.target.value
            setField('score', v === '' ? null : Number(v))
          }}
          placeholder={fields.absent ? '—' : 'Ex: 8,5'}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="canvas-feedback">Comentário (opcional)</Label>
        <Textarea
          id="canvas-feedback"
          value={fields.feedback ?? ''}
          onChange={(e) => setField('feedback', e.target.value || null)}
          rows={2}
          placeholder="Comentário pro aluno/responsável"
        />
      </div>

      {validationError && (
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

      <Button onClick={handleSubmit} disabled={!!validationError || isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Lançando…
          </>
        ) : (
          'Lançar nota'
        )}
      </Button>
    </div>
  )
}
