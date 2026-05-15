import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { cn } from '~/lib/utils'
import { api } from '~/lib/api'
import { AttendanceAttachmentsSection } from './attendance-attachments-section'

export type StatusValue = 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED'

const STATUS_ITEMS: Array<{ value: StatusValue; label: string }> = [
  { value: 'PRESENT', label: 'Presente' },
  { value: 'ABSENT', label: 'Faltou' },
  { value: 'LATE', label: 'Atrasado' },
  { value: 'JUSTIFIED', label: 'Justificado' },
]

const STATUS_TONE: Record<
  StatusValue,
  { trigger: string; chip: string; ring: string; dot: string }
> = {
  PRESENT: {
    trigger:
      'border-emerald-200/70 bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100',
    chip: 'bg-emerald-600 text-white hover:bg-emerald-600/95',
    ring: 'ring-emerald-300',
    dot: 'bg-emerald-500',
  },
  ABSENT: {
    trigger:
      'border-rose-200/70 bg-rose-50/80 text-rose-900 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-100',
    chip: 'bg-rose-600 text-white hover:bg-rose-600/95',
    ring: 'ring-rose-300',
    dot: 'bg-rose-500',
  },
  LATE: {
    trigger:
      'border-amber-200/70 bg-amber-50/80 text-amber-900 hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100',
    chip: 'bg-amber-600 text-white hover:bg-amber-600/95',
    ring: 'ring-amber-300',
    dot: 'bg-amber-500',
  },
  JUSTIFIED: {
    trigger:
      'border-slate-200/70 bg-slate-50/80 text-slate-900 hover:bg-slate-100 dark:border-slate-900/40 dark:bg-slate-950/40 dark:text-slate-100',
    chip: 'bg-slate-700 text-white hover:bg-slate-700/95',
    ring: 'ring-slate-300',
    dot: 'bg-slate-500',
  },
}

// Backend e DB agora usam JUSTIFIED consistentemente; mantemos o helper como
// camada fina pra futuras normalizações sem espalhar `as` pelos componentes.
export function normalizeStatus(raw: string): StatusValue {
  return raw as StatusValue
}

export function statusLabel(value: StatusValue) {
  return STATUS_ITEMS.find((s) => s.value === value)?.label ?? value
}

interface LastEdit {
  editedBy: { id: string; name: string } | null
  editedAt: string | null
}

interface AttendanceStatusEditorProps {
  studentHasAttendanceId: string
  classId: string
  currentStatus: StatusValue
  currentJustification: string | null
  lastEdit?: LastEdit | null
  requiresReason?: boolean
  onSaved?: () => void
  size?: 'sm' | 'md'
}

export function AttendanceStatusEditor({
  studentHasAttendanceId,
  classId,
  currentStatus,
  currentJustification,
  lastEdit,
  requiresReason = false,
  onSaved,
  size = 'md',
}: AttendanceStatusEditorProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<StatusValue>(currentStatus)
  const [justification, setJustification] = useState<string>(currentJustification ?? '')
  const [reason, setReason] = useState<string>('')
  const queryClient = useQueryClient()

  useEffect(() => {
    if (open) {
      setStatus(currentStatus)
      setJustification(currentJustification ?? '')
      setReason('')
    }
  }, [open, currentStatus, currentJustification])

  const mutation = useMutation(api.api.v1.attendance.update.mutationOptions())

  const showJustification = status === 'JUSTIFIED' || status === 'LATE'
  const reasonOk = !requiresReason || reason.trim().length > 0
  const hasChanges =
    status !== currentStatus || (justification || null) !== (currentJustification ?? null)
  const tone = STATUS_TONE[currentStatus]

  async function handleSave() {
    if (!hasChanges || !reasonOk) return
    try {
      await mutation.mutateAsync({
        params: { id: studentHasAttendanceId },
        body: {
          status,
          justification: showJustification ? justification.trim() || null : null,
          reason: requiresReason ? reason.trim() : undefined,
          classId,
        },
      })

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: api.api.v1.attendance.classStudents.pathKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: api.api.v1.attendance.student.history.pathKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: api.api.v1.attendance.lessons.index.pathKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: api.api.v1.attendance.lessons.students.pathKey(),
        }),
      ])

      toast.success('Presença atualizada')
      setOpen(false)
      onSaved?.()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.'
      toast.error(message)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
            tone.trigger,
            size === 'sm' ? 'h-6 px-2' : 'h-7 px-2.5'
          )}
          aria-label={`Editar status, atual: ${statusLabel(currentStatus)}`}
        >
          <span>{statusLabel(currentStatus)}</span>
          {lastEdit?.editedAt && (
            <span
              className="h-1 w-1 rounded-full bg-muted-foreground/60"
              aria-hidden="true"
              title="Editado manualmente"
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 gap-3">
        {requiresReason && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200/70 bg-amber-50/60 p-2 text-xs dark:border-amber-900/40 dark:bg-amber-950/30">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-300" />
            <div className="space-y-1">
              <p className="font-medium text-amber-900 dark:text-amber-100">
                Bimestre encerrado
              </p>
              <p className="text-amber-800/80 dark:text-amber-200/80">
                Informe o motivo da retificação. Fica registrado no histórico.
              </p>
            </div>
          </div>
        )}

        {requiresReason && (
          <div className="space-y-1.5">
            <label
              htmlFor={`reason-${studentHasAttendanceId}`}
              className="text-xs font-medium text-muted-foreground"
            >
              Motivo da retificação <span aria-hidden>*</span>
            </label>
            <Textarea
              id={`reason-${studentHasAttendanceId}`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ex: atestado entregue após o fechamento"
              rows={2}
              className="text-sm"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Status</span>
          <div className="grid grid-cols-2 gap-1.5" role="radiogroup">
            {STATUS_ITEMS.map((item) => {
              const active = status === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setStatus(item.value)}
                  className={cn(
                    'inline-flex h-8 items-center justify-center rounded-md border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                    active
                      ? STATUS_TONE[item.value].chip
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  )}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        {showJustification && (
          <div className="space-y-1.5">
            <label
              htmlFor={`justification-${studentHasAttendanceId}`}
              className="text-xs font-medium text-muted-foreground"
            >
              Justificativa <span className="font-normal">(opcional)</span>
            </label>
            <Textarea
              id={`justification-${studentHasAttendanceId}`}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="ex: atestado médico"
              rows={2}
              className="text-sm"
            />
          </div>
        )}

        {(currentStatus === 'JUSTIFIED' || currentStatus === 'LATE') && (
          <AttendanceAttachmentsSection studentHasAttendanceId={studentHasAttendanceId} />
        )}

        {lastEdit?.editedAt && (
          <p className="text-[11px] text-muted-foreground">
            Última edição
            {lastEdit.editedBy ? ` por ${lastEdit.editedBy.name}` : ''}, há{' '}
            {formatDistanceToNow(new Date(lastEdit.editedAt), { locale: ptBR })}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={mutation.isPending || !hasChanges || !reasonOk}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Salvando
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
