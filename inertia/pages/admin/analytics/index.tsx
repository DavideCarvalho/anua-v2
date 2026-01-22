import { Head } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { AdminLayout } from '../../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import {
  GraduationCap,
  Users,
  UtensilsCrossed,
  DollarSign,
  UserPlus,
  AlertTriangle,
  Trophy,
  Briefcase,
} from 'lucide-react'

const analyticsPages = [
  {
    title: 'Acadêmico',
    description: 'Notas, atividades e desempenho dos alunos',
    route: 'web.admin.analytics.academico' as const,
    icon: GraduationCap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Presença',
    description: 'Frequência, atrasos e absenteísmo',
    route: 'web.admin.analytics.presenca' as const,
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Cantina',
    description: 'Vendas, receita e itens populares',
    route: 'web.admin.analytics.cantina' as const,
    icon: UtensilsCrossed,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    title: 'Pagamentos',
    description: 'Mensalidades e inadimplência',
    route: 'web.admin.analytics.pagamentos' as const,
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    title: 'Matrículas',
    description: 'Alunos por período e curso',
    route: 'web.admin.analytics.matriculas' as const,
    icon: UserPlus,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: 'Ocorrências',
    description: 'Incidentes e registros disciplinares',
    route: 'web.admin.analytics.ocorrencias' as const,
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  {
    title: 'Gamificação',
    description: 'Pontos, conquistas e rankings',
    route: 'web.admin.analytics.gamificacao' as const,
    icon: Trophy,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    title: 'RH',
    description: 'Funcionários, professores e ponto',
    route: 'web.admin.analytics.rh' as const,
    icon: Briefcase,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
  },
]

export default function AdminAnalyticsIndex() {
  return (
    <AdminLayout>
      <Head title="Analytics" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Visão geral e métricas de todas as escolas da plataforma
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {analyticsPages.map((page) => {
            const Icon = page.icon
            return (
              <Link key={page.route} route={page.route}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className={`rounded-lg p-2 ${page.bgColor}`}>
                      <Icon className={`h-6 w-6 ${page.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{page.title}</CardTitle>
                      <CardDescription>{page.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  )
}
