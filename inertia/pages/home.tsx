import { Link } from '@tuyau/inertia/react'
import { useState } from 'react'
import {
  AlertCircle,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Building2,
  Calendar,
  ChartBar,
  Check,
  ClipboardList,
  CreditCard,
  DollarSign,
  FileText,
  GraduationCap,
  Settings,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import {
  SeoHead,
  getOrganizationSchema,
  getSoftwareApplicationSchema,
  getFAQSchema,
} from '~/components/seo/seo-head'

const insights: InsightCardProps[] = [
  {
    title: 'Alunos em Risco',
    value: '23',
    description: 'Detectados pela IA',
    icon: AlertCircle,
  },
  {
    title: 'Mensalidades',
    value: '15',
    description: 'Alerta automático de atrasos',
    icon: CreditCard,
  },
  {
    title: 'Matrículas',
    value: '156',
    description: 'Aumento de 12% este mês',
    icon: Users,
    trend: 'up',
  },
  {
    title: 'Insights Gerados',
    value: '47',
    description: 'Hoje pela IA',
    icon: Brain,
  },
]

const faqs = [
  {
    question: 'O que é o Anuá?',
    answer: 'Anuá é um sistema de gestão escolar completo que integra todas as áreas da sua escola em uma única plataforma, potencializado por inteligência artificial.',
  },
  {
    question: 'O Anuá tem inteligência artificial?',
    answer: 'Sim! Nossa IA analisa dados acadêmicos, financeiros e comportamentais para gerar insights automáticos, identificar alunos em risco e otimizar a gestão.',
  },
  {
    question: 'Posso fazer matrículas online?',
    answer: 'Sim, o Anuá oferece sistema completo de matrículas online com assinatura digital de contratos.',
  },
]

export default function Home() {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <SeoHead
        title="Sistema de Gestão Escolar com IA"
        description="Anuá é o sistema de gestão escolar completo com inteligência artificial. Matrículas online, gestão pedagógica, financeiro integrado, gamificação e muito mais. Experimente grátis!"
        keywords="sistema de gestão escolar, software para escola, gestão escolar com IA, matrícula online, controle de notas, frequência escolar, gestão pedagógica, ERP escolar, sistema educacional, cantina escolar, gamificação escolar"
        url="/"
        structuredData={[
          getOrganizationSchema(),
          getSoftwareApplicationSchema(),
          getFAQSchema(faqs),
        ]}
      />

      <div className="min-h-screen bg-background overflow-x-hidden">
        <header className="bg-background py-4 sm:py-5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="shrink-0">
                <Link route="web.home">
                  <span className="text-3xl font-bold text-purple-600">Anuá</span>
                </Link>
              </div>

              <div className="hidden lg:ml-12 lg:flex lg:items-center lg:space-x-8">
                <a
                  href="#funcionalidades"
                  className="text-lg font-medium text-muted-foreground transition-colors hover:text-purple-600"
                >
                  Funcionalidades
                </a>
                <a
                  href="#fale-conosco"
                  className="text-lg font-medium text-muted-foreground transition-colors hover:text-purple-600"
                >
                  Fale conosco
                </a>
              </div>

              <div className="hidden sm:flex sm:items-center sm:space-x-4">
                <Link
                  route="web.auth.signIn"
                  className="rounded-full bg-purple-600 px-8 py-3 text-base font-medium text-white transition-all hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
                >
                  Entrar
                </Link>
              </div>

              <div className="flex lg:hidden">
                <button
                  type="button"
                  className="inline-flex items-center rounded-full border border-purple-600 p-2.5 text-purple-600"
                  onClick={() => setExpanded(!expanded)}
                >
                  {!expanded ? (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="bg-gradient-to-b from-purple-50 to-background dark:from-purple-950/20 py-12 sm:py-16 lg:py-20" aria-labelledby="hero-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-2 lg:gap-x-16">
              <div className="flex flex-col justify-center">
                <div className="mb-4 inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/30 px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-300">
                  <Brain className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Sistema de Gestão Escolar com Inteligência Artificial</span>
                </div>
                <h1 id="hero-heading" className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Software de Gestão Escolar Completo{' '}
                  <span className="text-purple-600">Potencializado por IA</span>
                </h1>
                <p className="mt-6 text-lg text-muted-foreground lg:text-xl">
                  O Anuá é o <strong>sistema de gestão escolar</strong> que integra todas as áreas da sua instituição:
                  do administrativo ao pedagógico, do financeiro à gamificação. Nossa{' '}
                  <strong className="text-purple-600">Inteligência Artificial</strong>{' '}
                  gera insights automáticos, identifica alunos em risco e otimiza processos.
                  Muito mais que uma agenda escolar - é <strong>gestão completa com IA</strong>.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4">
                  <form className="flex-1">
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        placeholder="Seu melhor email"
                        className="w-full rounded-full border border-input bg-background px-6 py-3 text-foreground placeholder-muted-foreground focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-purple-600 px-8 py-3 font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
                      >
                        Começar
                      </button>
                    </div>
                  </form>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Gestão de Matrículas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Pedagógico Completo</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Financeiro Integrado</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Gamificação</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ChartBar className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Analytics Avançado</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-muted-foreground">IA Integrada</span>
                  </div>
                </div>
              </div>

              <div className="relative lg:mt-0">
                <div className="grid grid-cols-2 gap-4">
                  {insights.map((insight) => (
                    <InsightCard key={insight.title} {...insight} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de IA */}
        <section className="bg-gradient-to-b from-background to-muted/50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center">
                <div className="mb-4 inline-flex w-fit items-center rounded-full bg-purple-100 dark:bg-purple-900/30 px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-300">
                  <Brain className="mr-2 h-4 w-4" />
                  Powered by AI
                </div>
                <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                  Inteligência Artificial que realmente entende sua escola
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">
                  Nossa IA analisa continuamente todos os dados da sua escola - acadêmicos,
                  financeiros e comportamentais - para gerar insights valiosos e alertas automáticos
                  que você não encontraria sozinho.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <AlertCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Identificação de Alunos em Risco
                      </h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        IA detecta automaticamente alunos com risco de evasão por baixo desempenho,
                        faltas excessivas ou inadimplência
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <ChartBar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Analytics Preditivo</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Previsões de receita, tendências de matrícula e padrões de comportamento que
                        ajudam na tomada de decisão estratégica
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Brain className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Recomendações Inteligentes</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Sistema sugere ações específicas baseadas nos padrões identificados, como
                        contato com responsáveis ou ajustes na grade
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Grade Horária Inteligente</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Algoritmos avançados geram automaticamente a grade ideal considerando
                        disponibilidade dos professores e necessidades das turmas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="grid grid-cols-1 gap-6">
                  <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-background dark:from-purple-950/30">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                        Alertas Automáticos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="rounded-lg bg-background p-3 shadow-sm">
                          <p className="text-sm font-medium text-foreground">
                            23 alunos em risco de reprovação por faltas
                          </p>
                          <p className="text-xs text-muted-foreground">Detectado há 2 horas</p>
                        </div>
                        <div className="rounded-lg bg-background p-3 shadow-sm">
                          <p className="text-sm font-medium text-foreground">
                            15 mensalidades com atraso superior a 30 dias
                          </p>
                          <p className="text-xs text-muted-foreground">Detectado hoje às 08:00</p>
                        </div>
                        <div className="rounded-lg bg-background p-3 shadow-sm">
                          <p className="text-sm font-medium text-foreground">
                            Tendência de queda no desempenho da Turma 8A
                          </p>
                          <p className="text-xs text-muted-foreground">Detectado há 1 dia</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-background dark:from-purple-950/30">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                        Insights em Tempo Real
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="rounded-lg bg-background p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Taxa de presença</span>
                            <span className="text-lg font-bold text-green-600">94%</span>
                          </div>
                          <div className="mt-2 h-2 w-full rounded-full bg-muted">
                            <div className="h-2 w-[94%] rounded-full bg-green-500" />
                          </div>
                        </div>
                        <div className="rounded-lg bg-background p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Adimplência</span>
                            <span className="text-lg font-bold text-green-600">87%</span>
                          </div>
                          <div className="mt-2 h-2 w-full rounded-full bg-muted">
                            <div className="h-2 w-[87%] rounded-full bg-green-500" />
                          </div>
                        </div>
                        <div className="rounded-lg bg-background p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Média geral</span>
                            <span className="text-lg font-bold text-blue-600">8.3</span>
                          </div>
                          <div className="mt-2 h-2 w-full rounded-full bg-muted">
                            <div className="h-2 w-[83%] rounded-full bg-blue-500" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-16" id="funcionalidades" aria-labelledby="features-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <header className="text-center">
              <h2 id="features-heading" className="text-3xl font-bold text-foreground sm:text-4xl">
                Funcionalidades do Sistema de Gestão Escolar Anuá
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Todas as ferramentas que sua escola precisa em uma única plataforma integrada.
                Gestão administrativa, pedagógica, financeira e experiência completa para alunos e responsáveis.
              </p>
            </header>

            {/* Módulos Principais */}
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Administrativo */}
              <div className="rounded-xl bg-purple-50 dark:bg-purple-950/30 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">Gestão Administrativa</h3>
                <p className="mt-4 text-muted-foreground">
                  Matrículas online, gestão de alunos, professores e funcionários, folha de ponto,
                  controle de documentos e muito mais.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Matrículas online com assinatura digital
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Gestão completa de colaboradores
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Sistema de folha de ponto
                  </li>
                </ul>
              </div>

              {/* Pedagógico */}
              <div className="rounded-xl bg-purple-50 dark:bg-purple-950/30 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">Gestão Pedagógica</h3>
                <p className="mt-4 text-muted-foreground">
                  Turmas, grade horária, atividades, notas, frequência e ocorrências. Tudo integrado
                  e fácil de usar.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Grade horária inteligente
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Gestão de notas e atividades
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Controle de frequência
                  </li>
                </ul>
              </div>

              {/* Financeiro */}
              <div className="rounded-xl bg-purple-50 dark:bg-purple-950/30 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">Gestão Financeira</h3>
                <p className="mt-4 text-muted-foreground">
                  Mensalidades, contratos, cobranças automáticas, bolsas e parcerias. Gateway de
                  pagamento integrado.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Gateway de pagamento integrado
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Gestão de bolsas e parcerias
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Contratos com assinatura digital
                  </li>
                </ul>
              </div>

              {/* Gamificação */}
              <div className="rounded-xl bg-purple-50 dark:bg-purple-950/30 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">Gamificação</h3>
                <p className="mt-4 text-muted-foreground">
                  Sistema completo de pontos, conquistas, desafios, rankings e loja virtual para
                  engajar seus alunos.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Sistema de pontos e recompensas
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Conquistas e desafios
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Loja virtual integrada
                  </li>
                </ul>
              </div>

              {/* Analytics */}
              <div className="rounded-xl bg-purple-50 dark:bg-purple-950/30 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">
                  Inteligência e Analytics
                </h3>
                <p className="mt-4 text-muted-foreground">
                  Dashboards, relatórios e insights automáticos para tomada de decisão baseada em
                  dados.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Alunos em risco de evasão
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Métricas financeiras e acadêmicas
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Relatórios personalizáveis
                  </li>
                </ul>
              </div>

              {/* Comunicação */}
              <div className="rounded-xl bg-purple-50 dark:bg-purple-950/30 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">Comunicação Integrada</h3>
                <p className="mt-4 text-muted-foreground">
                  Notificações por email, SMS, WhatsApp e push. Sistema de preferências para cada
                  tipo de notificação.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Multi-canal (Email, SMS, WhatsApp, Push)
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Feed social interno
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-purple-600" />
                    Gestão de preferências
                  </li>
                </ul>
              </div>
            </div>

            {/* Seção de Diferenciais */}
            <div className="mt-20">
              <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 p-12 text-white">
                <div className="text-center">
                  <Sparkles className="mx-auto h-12 w-12" />
                  <h3 className="mt-6 text-2xl font-bold sm:text-3xl">E muito mais...</h3>
                  <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
                    Cantina, solicitações de compra e impressão, gestão de períodos acadêmicos,
                    bolsas e parcerias, controle de coordenadores, gestão de redes com múltiplas
                    escolas e integrações com os melhores serviços do mercado.
                  </p>
                </div>

                <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                  <div className="text-center">
                    <ShoppingCart className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-sm font-medium">Cantina Digital</p>
                  </div>
                  <div className="text-center">
                    <FileText className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-sm font-medium">Assinatura Digital</p>
                  </div>
                  <div className="text-center">
                    <ClipboardList className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-sm font-medium">Solicitações</p>
                  </div>
                  <div className="text-center">
                    <BookOpen className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-sm font-medium">Biblioteca</p>
                  </div>
                  <div className="text-center">
                    <Settings className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-sm font-medium">Redes de Ensino</p>
                  </div>
                  <div className="text-center">
                    <Brain className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-sm font-medium">IA Integrada</p>
                  </div>
                  <div className="text-center">
                    <Users className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-sm font-medium">Portal do Aluno</p>
                  </div>
                  <div className="text-center">
                    <Wallet className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-sm font-medium">Gateway Pagamento</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Contact />
        <Footer />
      </div>
    </>
  )
}

function Contact() {
  return (
    <section className="bg-purple-50 dark:bg-purple-950/20 py-16" id="fale-conosco" aria-labelledby="contact-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="text-center">
          <h2 id="contact-heading" className="text-3xl font-bold text-foreground sm:text-4xl">
            Entre em contato conosco
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Nossa equipe especializada está pronta para mostrar como o sistema de gestão escolar com IA pode transformar sua instituição
          </p>
        </header>

        <div className="mt-12 rounded-xl bg-card p-8 shadow-lg">
          <form className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="Digite seu nome" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Digite seu email" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolName">Nome da Escola</Label>
              <Input id="schoolName" placeholder="Digite o nome da escola" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" type="tel" placeholder="Digite seu telefone" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea id="message" placeholder="Digite sua mensagem" className="min-h-[120px]" />
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" className="w-full" size="lg">
                Falar com especialista
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-background py-12 border-t" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-6 sm:flex-row sm:space-y-0">
          <nav aria-label="Links do rodapé" className="flex space-x-6">
            <a href="#funcionalidades" className="text-muted-foreground hover:text-purple-600 transition-colors">
              Funcionalidades
            </a>
            <a href="#fale-conosco" className="text-muted-foreground hover:text-purple-600 transition-colors">
              Fale Conosco
            </a>
          </nav>
          <div className="text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Anuá - Sistema de Gestão Escolar. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

interface InsightCardProps {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down'
}

function InsightCard({ title, value, description, icon: Icon, trend }: InsightCardProps) {
  const trendColor = trend === 'up' ? 'text-green-500' : 'text-red-500'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <Icon className="h-6 w-6 text-purple-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={`flex items-center ${trendColor} mt-2`}>
            <TrendingUp className="mr-1 h-4 w-4" />
            <span className="text-sm">12%</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
