import { useState } from 'react'
import type { ToolUIPart } from 'ai'
import { Check, Loader2, AlertTriangle, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

type StepStatus = 'pending' | 'in_progress' | 'completed' | 'error'

// Labels PT-BR pra TODA tool do personas.ts. Importante manter cobertura
// total — o fallback genérico abaixo é só pra novas tools que ainda não
// foram traduzidas. Nome cru da tool (camelCase) JAMAIS chega ao usuário.
const TOOL_LABELS_PROGRESS: Record<string, string> = {
  // Geral / análise
  getSchoolStats: 'Buscando estatísticas da escola',
  getStudentAlerts: 'Buscando alertas de alunos',
  getHistoricalComparison: 'Comparando com período passado',
  getSchema: 'Analisando estrutura dos dados',
  queryDatabase: 'Consultando dados',
  // Turmas / alunos
  getMyClasses: 'Buscando turmas',
  getStudentsInClass: 'Buscando alunos da turma',
  getMyChildren: 'Buscando filhos',
  // Pedagógico
  getStudentGrades: 'Buscando notas',
  getAssignments: 'Buscando atividades',
  getExams: 'Buscando provas',
  getStudentAttendance: 'Buscando frequência',
  // Financeiro
  getStudentFinancials: 'Buscando boletos',
  // Comunicação
  getCommunications: 'Buscando comunicados',
  sendCommunication: 'Preparando comunicado',
  // Escrita (cards de aprovação — geralmente renderizam fora do step group,
  // mas se passarem por aqui o label cobre)
  enterExamGrade: 'Lançando nota',
  registerAttendance: 'Registrando presença',
  justifyAbsence: 'Justificando falta',
  prepareCreateAssignment: 'Preparando atividade',
  // Render
  formatRows: 'Formatando resultado',
  renderResult: 'Preparando visualização',
}

const TOOL_LABELS_DONE: Record<string, string> = {
  getSchoolStats: 'Estatísticas obtidas',
  getStudentAlerts: 'Alertas obtidos',
  getHistoricalComparison: 'Comparação pronta',
  getSchema: 'Estrutura mapeada',
  queryDatabase: 'Dados consultados',
  getMyClasses: 'Turmas obtidas',
  getStudentsInClass: 'Alunos obtidos',
  getMyChildren: 'Filhos obtidos',
  getStudentGrades: 'Notas obtidas',
  getAssignments: 'Atividades obtidas',
  getExams: 'Provas obtidas',
  getStudentAttendance: 'Frequência obtida',
  getStudentFinancials: 'Boletos obtidos',
  getCommunications: 'Comunicados obtidos',
  sendCommunication: 'Comunicado pronto',
  enterExamGrade: 'Nota lançada',
  registerAttendance: 'Presença registrada',
  justifyAbsence: 'Falta justificada',
  prepareCreateAssignment: 'Atividade preparada',
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
  // Fallback genérico — se uma tool nova entrar no sistema sem label aqui,
  // mostramos um texto neutro em vez do nome cru (camelCase é detalhe de
  // implementação que não deve chegar ao usuário). Adicione o label nos
  // mapas acima quando aparecer no log "Trabalhando…" sem nome bonito.
  if (status === 'completed') {
    return TOOL_LABELS_DONE[toolName] ?? 'Operação concluída'
  }
  if (status === 'error') {
    const base = TOOL_LABELS_PROGRESS[toolName] ?? 'Operação'
    return `${base} (falhou)`
  }
  return TOOL_LABELS_PROGRESS[toolName] ?? 'Trabalhando…'
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
