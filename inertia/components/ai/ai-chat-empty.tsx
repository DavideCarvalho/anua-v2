import {
  Sparkles,
  BarChart3,
  AlertTriangle,
  GraduationCap,
  Users,
  ClipboardCheck,
  Baby,
  BookOpen,
  Megaphone,
} from 'lucide-react'
import { cn } from '../../lib/utils'

export type ChatPersonaRole = 'gestor' | 'coordenador' | 'professor' | 'responsavel'

type Suggestion = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  prompt: string
}

const SUGGESTIONS_BY_PERSONA: Record<ChatPersonaRole, Suggestion[]> = {
  gestor: [
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
      icon: Megaphone,
      label: 'Enviar comunicado',
      prompt: 'Quero enviar um comunicado pros pais',
    },
  ],
  coordenador: [
    {
      icon: GraduationCap,
      label: 'Minhas turmas',
      prompt: 'Liste as turmas que eu coordeno',
    },
    {
      icon: ClipboardCheck,
      label: 'Próximas provas',
      prompt: 'Quais são as próximas provas das minhas turmas?',
    },
    {
      icon: Users,
      label: 'Alunos de uma turma',
      prompt: 'Me mostre os alunos de uma das minhas turmas',
    },
    {
      icon: Sparkles,
      label: 'O que posso fazer aqui?',
      prompt: 'O que você consegue me ajudar como coordenador?',
    },
  ],
  professor: [
    {
      icon: GraduationCap,
      label: 'Minhas turmas',
      prompt: 'Liste as turmas onde eu dou aula',
    },
    {
      icon: ClipboardCheck,
      label: 'Atividades em aberto',
      prompt: 'Quais atividades das minhas turmas têm prazo aberto?',
    },
    {
      icon: Users,
      label: 'Alunos de uma turma',
      prompt: 'Me mostre os alunos de uma das minhas turmas',
    },
    {
      icon: Sparkles,
      label: 'O que posso fazer aqui?',
      prompt: 'O que você consegue me ajudar como professor?',
    },
  ],
  responsavel: [
    {
      icon: Baby,
      label: 'Meus filhos',
      prompt: 'Quem são meus filhos cadastrados?',
    },
    {
      icon: BookOpen,
      label: 'Notas do meu filho',
      prompt: 'Quero ver as notas do meu filho',
    },
    {
      icon: ClipboardCheck,
      label: 'Próximas provas',
      prompt: 'Quais são as próximas provas do meu filho?',
    },
    {
      icon: Sparkles,
      label: 'Boletos em aberto',
      prompt: 'Tem algum boleto em aberto do meu filho?',
    },
  ],
}

const SUBTITLE_BY_PERSONA: Record<ChatPersonaRole, string> = {
  gestor: 'Pergunte sobre alunos, turmas, financeiro ou qualquer dado da escola.',
  coordenador:
    'Pergunte sobre as turmas que você coordena — alunos, atividades, provas, frequência.',
  professor: 'Pergunte sobre suas turmas — alunos, atividades, provas, frequência.',
  responsavel: 'Pergunte sobre seus filhos — notas, provas, frequência, boletos, comunicados.',
}

type AiChatEmptyProps = {
  onPick: (prompt: string) => void
  userName?: string
  persona?: ChatPersonaRole
  // Quando presente, substitui os SUGGESTIONS_BY_PERSONA defaults pra
  // refletir contexto da tela (ex: filtros ativos no dashboard). Cada
  // string vira um botão com o ícone Sparkles padrão.
  suggestions?: string[]
}

export function AiChatEmpty({
  onPick,
  userName,
  persona = 'gestor',
  suggestions,
}: AiChatEmptyProps) {
  const subtitle = SUBTITLE_BY_PERSONA[persona]
  const items: Suggestion[] = suggestions
    ? suggestions.map((prompt) => ({
        icon: Sparkles,
        label: prompt.length > 32 ? prompt.slice(0, 31) + '…' : prompt,
        prompt,
      }))
    : SUGGESTIONS_BY_PERSONA[persona]
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center px-6 py-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {userName ? `Olá, ${userName.split(' ')[0]}` : 'Como posso ajudar?'}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map(({ icon: Icon, label, prompt }) => (
          <button
            key={label + prompt}
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
