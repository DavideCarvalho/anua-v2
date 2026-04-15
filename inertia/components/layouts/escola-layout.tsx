import { usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import type { PropsWithChildren, ReactNode } from 'react'
import { PostHogProvider } from '../posthog-provider'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  UtensilsCrossed,
  DollarSign,
  ShoppingBag,
  Trophy,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  School,
  Megaphone,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { buttonVariants } from '../ui/button'
import type { SharedProps } from '../../lib/types'
import { cn, ClientOnly } from '../../lib/utils'
import { formatRoleName } from '../../lib/formatters'
import { ImpersonationBanner } from '../admin/impersonation-banner'
import { SidebarAcademicPeriods } from '../sidebar/sidebar-academic-periods'
import { SchoolGroupSwitcher } from '../sidebar/school-group-switcher'
import { NotificationBell } from '../notifications/notification-bell'
import { useAuthUser } from '../../stores/auth_store'
import { registry } from '@generated/registry/index'

interface NavItem {
  title: string
  route: keyof typeof registry.routes
  href: string
  icon: React.ElementType
  children?: {
    title: string
    route: keyof typeof registry.routes
    href: string
    badge?: ReactNode
  }[]
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    route: 'web.escola.dashboard',
    href: '/escola',
    icon: LayoutDashboard,
  },
  {
    title: 'Administrativo',
    route: 'web.escola.administrativo.alunos',
    href: '/escola/administrativo',
    icon: Users,
    children: [
      {
        title: 'Alunos',
        route: 'web.escola.administrativo.alunos',
        href: '/escola/administrativo/alunos',
      },
      {
        title: 'Funcionários',
        route: 'web.escola.administrativo.funcionarios',
        href: '/escola/administrativo/funcionarios',
      },
      {
        title: 'Professores',
        route: 'web.escola.administrativo.professores',
        href: '/escola/administrativo/professores',
      },
      // { title: 'Matrículas', route: 'web.escola.administrativo.matriculas', href: '/escola/administrativo/matriculas' },
      // { title: 'Parceiros', route: 'web.escola.administrativo.parceiros', href: '/escola/administrativo/parceiros' },
      {
        title: 'Matérias',
        route: 'web.escola.administrativo.materias',
        href: '/escola/administrativo/materias',
      },
      // { title: 'Folha de Ponto', route: 'web.escola.administrativo.folhaDePonto', href: '/escola/administrativo/folha-de-ponto' },
    ],
  },
  {
    title: 'Pedagógico',
    route: 'web.escola.pedagogico.turmas',
    href: '/escola/pedagogico',
    icon: BookOpen,
    children: [
      { title: 'Turmas', route: 'web.escola.pedagogico.turmas', href: '/escola/pedagogico/turmas' },
      { title: 'Grade', route: 'web.escola.pedagogico.grade', href: '/escola/pedagogico/grade' },
      {
        title: 'Aulas Avulsas',
        route: 'web.escola.pedagogico.aulasAvulsas',
        href: '/escola/pedagogico/aulas-avulsas',
      },
      {
        title: 'Calendário',
        route: 'web.escola.pedagogico.calendario',
        href: '/escola/pedagogico/calendario',
      },
      {
        title: 'Registro diário',
        route: 'web.escola.pedagogico.ocorrencias',
        href: '/escola/pedagogico/registro-diario',
      },
      {
        title: 'Mensagens',
        route: 'web.escola.perguntas',
        href: '/escola/duvidas-responsaveis',
        badge: <UnreadMessagesBadge />,
      },
    ],
  },
  {
    title: 'Períodos Letivos',
    route: 'web.escola.periodosLetivos',
    href: '/escola/periodos-letivos',
    icon: Calendar,
  },
  {
    title: 'Comunicados',
    route: 'web.escola.comunicados',
    href: '/escola/comunicados',
    icon: Megaphone,
  },
  {
    title: 'Cantina',
    route: 'web.escola.cantina.pdv',
    href: '/escola/cantina',
    icon: UtensilsCrossed,
    children: [
      { title: 'PDV', route: 'web.escola.cantina.pdv', href: '/escola/cantina/pdv' },
      { title: 'Itens', route: 'web.escola.cantina.itens', href: '/escola/cantina/itens' },
      { title: 'Cardápio', route: 'web.escola.cantina.cardapio', href: '/escola/cantina/cardapio' },
      { title: 'Pedidos', route: 'web.escola.cantina.pedidos', href: '/escola/cantina/pedidos' },
      { title: 'Vendas', route: 'web.escola.cantina.vendas', href: '/escola/cantina/vendas' },
      { title: 'Reservas', route: 'web.escola.cantina.reservas', href: '/escola/cantina/reservas' },
      {
        title: 'Recorrências',
        route: 'web.escola.cantina.recorrencias',
        href: '/escola/cantina/recorrencias',
      },
      {
        title: 'Transferências',
        route: 'web.escola.cantina.transferencias',
        href: '/escola/cantina/transferencias',
      },
    ],
  },
  {
    title: 'Financeiro',
    route: 'web.escola.financeiro.faturas',
    href: '/escola/financeiro',
    icon: DollarSign,
    children: [
      {
        title: 'Faturas',
        route: 'web.escola.financeiro.faturas',
        href: '/escola/financeiro/faturas',
      },
      {
        title: 'Inadimplência',
        route: 'web.escola.financeiro.inadimplencia',
        href: '/escola/financeiro/inadimplencia',
      },
      {
        title: 'Contratos',
        route: 'web.escola.administrativo.contratos',
        href: '/escola/administrativo/contratos',
      },
      {
        title: 'Bolsas',
        route: 'web.escola.administrativo.bolsas',
        href: '/escola/administrativo/bolsas',
      },
      {
        title: 'Configuração',
        route: 'web.escola.financeiro.configuracaoPagamentos',
        href: '/escola/financeiro/configuracao-pagamentos',
      },
    ],
  },
  {
    title: 'Lojas',
    route: 'web.escola.lojas.index',
    href: '/escola/lojas',
    icon: ShoppingBag,
  },
  {
    title: 'Gamificação',
    route: 'web.escola.gamificacao.index',
    href: '/escola/gamificacao',
    icon: Trophy,
    children: [
      {
        title: 'Rankings',
        route: 'web.escola.gamificacao.rankings',
        href: '/escola/gamificacao/rankings',
      },
      {
        title: 'Conquistas',
        route: 'web.escola.gamificacao.conquistas',
        href: '/escola/gamificacao/conquistas',
      },
      {
        title: 'Desafios',
        route: 'web.escola.gamificacao.desafios',
        href: '/escola/gamificacao/desafios',
      },
      {
        title: 'Recompensas',
        route: 'web.escola.gamificacao.recompensas',
        href: '/escola/gamificacao/recompensas',
      },
    ],
  },
  {
    title: 'Configurações',
    route: 'web.escola.configuracoes',
    href: '/escola/configuracoes',
    icon: Settings,
  },
]

function NavItemComponent({
  item,
  isActive,
  pathname,
}: {
  item: NavItem
  isActive: boolean
  pathname: string
}) {
  const [isOpen, setIsOpen] = useState(isActive)
  const hasChildren = item.children && item.children.length > 0
  const Icon = item.icon

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-4 w-4" />
            {item.title}
          </div>
          <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        </button>
        {isOpen && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children!.map((child) => (
              <Link
                key={child.route}
                route={child.route}
                routeParams={undefined}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                  pathname === child.href
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <span>{child.title}</span>
                {child.badge}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      route={item.route}
      routeParams={undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        pathname === item.href
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      {item.title}
    </Link>
  )
}

function UnreadMessagesBadge() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/v1/escola/inquiries?limit=50', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const unreadCount = (data.data ?? []).filter(
          (i: { hasUnread: boolean }) => i.hasUnread
        ).length
        // Fetches up to 50 inquiries to get a meaningful unread count for the badge.
        setCount(unreadCount)
      })
      .catch(() => setCount(0))
  }, [])

  if (!count || count === 0) return null

  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
      {count > 99 ? '99+' : count}
    </span>
  )
}

type EscolaLayoutProps = PropsWithChildren<{
  topbarActions?: ReactNode
}>

export function EscolaLayout({ children, topbarActions }: EscolaLayoutProps) {
  const { url } = usePage<SharedProps>()
  const user = useAuthUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = url.split('?')[0]
  const isSchoolTeacher = user?.role?.name === 'SCHOOL_TEACHER' || user?.role?.name === 'TEACHER'
  const visibleNavigation = isSchoolTeacher
    ? navigation.filter((item) => item.title === 'Pedagógico')
    : navigation

  return (
    <PostHogProvider>
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        <ImpersonationBanner />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Mobile sidebar backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <div className="flex h-full flex-col">
              {/* Logo */}
              <div className="flex h-14 items-center border-b px-4">
                <Link route="web.escola.dashboard" className="flex items-center gap-2">
                  <School className="h-6 w-6 text-primary" />
                  <span className="font-bold text-lg">Anua</span>
                </Link>
                <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* School switcher */}
              <ClientOnly
                fallback={
                  <div className="border-b px-4 py-3">
                    <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
                  </div>
                }
              >
                <SchoolGroupSwitcher />
              </ClientOnly>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-1">
                  {visibleNavigation.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.children?.some((child) => pathname === child.href) ?? false)
                    return (
                      <NavItemComponent
                        key={item.href}
                        item={item}
                        isActive={isActive}
                        pathname={pathname}
                      />
                    )
                  })}
                </div>

                {/* Academic Periods with Classes */}
                <div className="mt-4 border-t pt-4">
                  <SidebarAcademicPeriods />
                </div>
              </nav>

              {/* User section */}
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
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full mt-3')}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Link>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:pl-0">
            {/* Top bar */}
            <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 lg:px-6">
              <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>

              <div
                data-testid="escola-layout-topbar-actions"
                className="ml-auto flex items-center gap-2"
              >
                {topbarActions}
                <NotificationBell allNotificationsRoute="web.escola.notificacoes" />
              </div>
            </header>

            {/* Page content */}
            <main className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </div>
    </PostHogProvider>
  )
}
