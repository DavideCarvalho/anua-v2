import { usePage } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import type { RouteName } from '@tuyau/client'
import type { PropsWithChildren } from 'react'
import { PostHogProvider } from '../posthog-provider'
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  UtensilsCrossed,
  DollarSign,
  Trophy,
  FileText,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ClipboardCheck,
  Wallet,
  AlertTriangle,
  Clock,
  ShoppingBag,
} from 'lucide-react'
import { useState } from 'react'
import type { SharedProps } from '../../lib/types'
import { cn } from '../../lib/utils'
import { formatRoleName } from '../../lib/formatters'
import { ImpersonationBanner } from '../admin/impersonation-banner'
import { StudentSelectorWithData } from '../responsavel/student-selector'
import { NotificationBell } from '../notifications/notification-bell'
import { useQuery } from '@tanstack/react-query'
import { useResponsavelStatsQueryOptions } from '../../hooks/queries/use_responsavel_stats'
import { api } from '../../../.adonisjs/api'

interface NavItem {
  title: string
  route: RouteName<typeof api.routes>
  href: string
  icon: React.ElementType
  requiresPedagogical?: boolean
  requiresFinancial?: boolean
}

// Navigation items organized by category
const baseNavigation: NavItem[] = [
  {
    title: 'Início',
    route: 'web.responsavel.dashboard',
    href: '/responsavel',
    icon: LayoutDashboard,
  },
  {
    title: 'Comunicados',
    route: 'web.responsavel.comunicados',
    href: '/responsavel/comunicados',
    icon: Bell,
  },
  {
    title: 'Autorizações',
    route: 'web.responsavel.autorizacoes',
    href: '/responsavel/autorizacoes',
    icon: ClipboardCheck,
  },
]

const pedagogicalNavigation: NavItem[] = [
  {
    title: 'Frequência',
    route: 'web.responsavel.frequencia',
    href: '/responsavel/frequencia',
    icon: Calendar,
    requiresPedagogical: true,
  },
  {
    title: 'Horário',
    route: 'web.responsavel.horario',
    href: '/responsavel/horario',
    icon: Clock,
    requiresPedagogical: true,
  },
  {
    title: 'Atividades',
    route: 'web.responsavel.atividades',
    href: '/responsavel/atividades',
    icon: FileText,
    requiresPedagogical: true,
  },
  {
    title: 'Notas',
    route: 'web.responsavel.notas',
    href: '/responsavel/notas',
    icon: BookOpen,
    requiresPedagogical: true,
  },
  {
    title: 'Ocorrências',
    route: 'web.responsavel.ocorrencias',
    href: '/responsavel/ocorrencias',
    icon: AlertTriangle,
    requiresPedagogical: true,
  },
  {
    title: 'Documentos',
    route: 'web.responsavel.documentos',
    href: '/responsavel/documentos',
    icon: FileText,
    requiresPedagogical: true,
  },
]

const financialNavigation: NavItem[] = [
  {
    title: 'Crédito',
    route: 'web.responsavel.credito',
    href: '/responsavel/credito',
    icon: Wallet,
    requiresFinancial: true,
  },
  {
    title: 'Mensalidades',
    route: 'web.responsavel.mensalidades',
    href: '/responsavel/mensalidades',
    icon: DollarSign,
    requiresFinancial: true,
  },
]

const commonNavigation: NavItem[] = [
  {
    title: 'Gamificação',
    route: 'web.responsavel.gamificacao',
    href: '/responsavel/gamificacao',
    icon: Trophy,
  },
  {
    title: 'Cantina',
    route: 'web.responsavel.cantina',
    href: '/responsavel/cantina',
    icon: UtensilsCrossed,
  },
  {
    title: 'Loja',
    route: 'web.responsavel.loja' as any,
    href: '/responsavel/loja',
    icon: ShoppingBag,
  },
  { title: 'Perfil', route: 'web.responsavel.perfil', href: '/responsavel/perfil', icon: User },
]

function NavigationContent() {
  const { url } = usePage<SharedProps>()
  const { data, isLoading } = useQuery(useResponsavelStatsQueryOptions())
  const pathname = url.split('?')[0]

  if (isLoading || !data) {
    return (
      <div className="space-y-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-muted" />
        ))}
      </div>
    )
  }

  // Get selected student from URL or first student
  let selectedStudentId: string | null = null
  try {
    const urlObj =
      typeof window !== 'undefined'
        ? new URL(url, window.location.origin)
        : new URL(`http://localhost${url}`)
    selectedStudentId = urlObj.searchParams.get('aluno')
  } catch {
    const match = url.match(/[?&]aluno=([^&]+)/)
    selectedStudentId = match ? match[1] : null
  }

  const studentId = selectedStudentId || data.students[0]?.id
  const selectedStudent = data.students.find((s) => s.id === studentId) || data.students[0]

  const hasPedagogical = selectedStudent?.permissions?.pedagogical || false
  const hasFinancial = selectedStudent?.permissions?.financial || false

  // Build navigation based on permissions
  const navigation = [
    ...baseNavigation,
    ...(hasPedagogical ? pedagogicalNavigation : []),
    ...commonNavigation,
    ...(hasFinancial ? financialNavigation : []),
  ]

  return (
    <div className="space-y-1">
      {navigation.map((item: NavItem) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.route}
            route={item.route}
            params={undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </div>
  )
}

export function ResponsavelLayout({ children }: PropsWithChildren) {
  const { props } = usePage<SharedProps>()
  const user = props.user
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <PostHogProvider>
      <div className="min-h-screen bg-background">
        <ImpersonationBanner />
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center border-b px-4">
              <Link route="web.responsavel.dashboard" className="flex items-center gap-2">
                <span className="font-bold text-lg text-primary">Anua</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  Responsável
                </span>
              </Link>
              <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <NavigationContent />
            </nav>

            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {formatRoleName(user?.role?.name)}
                  </p>
                </div>
              </div>
              <Link
                route="api.v1.auth.logout"
                as="button"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Link>
            </div>
          </div>
        </aside>

        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="ml-auto flex items-center gap-2">
              <NotificationBell allNotificationsRoute="web.responsavel.comunicados" />
              <StudentSelectorWithData />
            </div>
          </header>
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </PostHogProvider>
  )
}
