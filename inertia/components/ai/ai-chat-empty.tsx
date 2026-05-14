import { Sparkles, BarChart3, AlertTriangle, GraduationCap } from 'lucide-react'
import { cn } from '../../lib/utils'

type Suggestion = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  prompt: string
}

const SUGGESTIONS: Suggestion[] = [
  {
    icon: BarChart3,
    label: 'Resumo da escola',
    prompt: 'Me dá um resumo da escola: total de alunos e inadimplência atual',
  },
  {
    icon: AlertTriangle,
    label: 'Alunos com problemas',
    prompt: 'Quais alunos têm pagamentos vencidos no momento?',
  },
  {
    icon: GraduationCap,
    label: 'Alunos por turma',
    prompt: 'Cria um gráfico de barras com a distribuição de alunos por turma',
  },
  {
    icon: Sparkles,
    label: 'Análise livre',
    prompt: 'O que você consegue analisar dos dados desta escola?',
  },
]

type AiChatEmptyProps = {
  onPick: (prompt: string) => void
  userName?: string
}

export function AiChatEmpty({ onPick, userName }: AiChatEmptyProps) {
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center px-6 py-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {userName ? `Olá, ${userName.split(' ')[0]}` : 'Como posso ajudar?'}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Pergunte sobre alunos, turmas, financeiro ou qualquer dado da escola.
        </p>
      </div>
      <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
          <button
            key={label}
            type="button"
            onClick={() => onPick(prompt)}
            className={cn(
              'group flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left',
              'transition-all duration-150 hover:border-primary/40 hover:bg-accent/40 hover:shadow-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            <span className="mt-0.5 rounded-md bg-primary/10 p-1.5 text-primary transition-colors group-hover:bg-primary/15">
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-foreground">{label}</span>
              <span className="block truncate text-xs text-muted-foreground mt-0.5">
                {prompt}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
