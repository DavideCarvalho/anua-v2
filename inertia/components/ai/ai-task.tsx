import { useState } from 'react'
import type { ToolUIPart } from 'ai'
import { Check, Loader2, AlertTriangle, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

type StepStatus = 'pending' | 'in_progress' | 'completed' | 'error'

const TOOL_LABELS_PROGRESS: Record<string, string> = {
  getSchoolStats: 'Buscando estatísticas da escola',
  getStudentAlerts: 'Buscando alertas de alunos',
  getSchema: 'Analisando estrutura dos dados',
  queryDatabase: 'Consultando dados',
  formatRows: 'Formatando resultado',
  renderResult: 'Preparando visualização',
}

const TOOL_LABELS_DONE: Record<string, string> = {
  getSchoolStats: 'Estatísticas obtidas',
  getStudentAlerts: 'Alertas obtidos',
  getSchema: 'Estrutura mapeada',
  queryDatabase: 'Dados consultados',
  formatRows: 'Resultado formatado',
  renderResult: 'Visualização pronta',
}

function statusFromState(state: ToolUIPart['state']): StepStatus {
  switch (state) {
    case 'input-streaming':
    case 'input-available':
      return 'in_progress'
    case 'output-available':
      return 'completed'
    case 'output-error':
    case 'output-denied':
      return 'error'
    default:
      return 'pending'
  }
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'in_progress') {
    return <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
  }
  if (status === 'completed') {
    return <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" strokeWidth={3} />
  }
  if (status === 'error') {
    return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
  }
  return <div className="ml-[5px] mr-[5px] h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
}

function toolLabel(toolName: string, status: StepStatus) {
  if (status === 'completed') {
    return TOOL_LABELS_DONE[toolName] ?? TOOL_LABELS_PROGRESS[toolName] ?? toolName
  }
  if (status === 'error') {
    const base = TOOL_LABELS_PROGRESS[toolName] ?? toolName
    return `${base} (falhou)`
  }
  return TOOL_LABELS_PROGRESS[toolName] ?? toolName
}

export function ToolStepGroup({ parts }: { parts: ToolUIPart[] }) {
  const [open, setOpen] = useState(true)

  const completedCount = parts.filter((p) => p.state === 'output-available').length
  const erroredCount = parts.filter(
    (p) => p.state === 'output-error' || p.state === 'output-denied'
  ).length
  const inFlight = parts.some(
    (p) => p.state === 'input-streaming' || p.state === 'input-available'
  )
  const allDone = !inFlight

  // Single step: flat row, no collapse. The tool's own label ("Estatísticas
  // obtidas", "Dados consultados") is already self-describing — wrapping it
  // in "1 etapa concluída" + a list with one item is just noise.
  if (parts.length === 1) {
    const part = parts[0]
    const toolName = part.type.slice('tool-'.length)
    const status = statusFromState(part.state)
    return (
      <div className="my-2 inline-flex items-center gap-2 rounded-md border border-border bg-card/50 px-3 py-1.5 text-xs">
        <StepIcon status={status} />
        <span
          className={cn(
            'font-medium',
            status === 'error' ? 'text-destructive' : 'text-foreground'
          )}
        >
          {toolLabel(toolName, status)}
        </span>
      </div>
    )
  }

  const headerText = inFlight
    ? `Trabalhando (${completedCount}/${parts.length})…`
    : `${completedCount} etapas concluídas${erroredCount > 0 ? `, ${erroredCount} com erro` : ''}`

  return (
    <div className="my-2 rounded-md border border-border bg-card/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-accent/40"
        aria-expanded={open}
      >
        <ChevronRight
          className={cn(
            'h-3 w-3 text-muted-foreground transition-transform duration-200',
            open && 'rotate-90'
          )}
        />
        {inFlight ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        ) : erroredCount > 0 ? (
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
        ) : (
          <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" strokeWidth={3} />
        )}
        <span className="font-medium text-foreground">{headerText}</span>
      </button>
      {open && (
        <ol className="space-y-1.5 border-t border-border/60 px-3 pb-3 pt-2">
          {parts.map((part, i) => {
            const toolName = part.type.slice('tool-'.length)
            const status = statusFromState(part.state)
            return (
              <li key={part.toolCallId ?? i} className="flex items-center gap-2 text-xs">
                <StepIcon status={status} />
                <span
                  className={cn(
                    status === 'in_progress' ? 'text-foreground' : 'text-muted-foreground',
                    status === 'error' && 'text-destructive'
                  )}
                >
                  {toolLabel(toolName, status)}
                </span>
              </li>
            )
          })}
        </ol>
      )}
      {allDone && open && (
        <div className="border-t border-border/60 px-3 py-1.5 text-[10px] text-muted-foreground">
          Clique no cabeçalho pra esconder as etapas.
        </div>
      )}
    </div>
  )
}
