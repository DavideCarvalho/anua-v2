import { usePage } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import type { PropsWithChildren } from 'react'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  UtensilsCrossed,
  DollarSign,
  Trophy,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  School,
} from 'lucide-react'
import { useState } from 'react'
import { Button, buttonVariants } from '../ui/button'
import type { SharedProps } from '../../lib/types'
import { cn } from '../../lib/utils'
import { formatRoleName } from '../../lib/formatters'
import { ImpersonationBanner } from '../admin/impersonation-banner'
import { SidebarAcademicPeriods } from '../sidebar/sidebar-academic-periods'
import { SchoolGroupSwitcher } from '../sidebar/school-group-switcher'

interface NavItem {
  title: string
  route: string
  href: string
  icon: React.ElementType
  children?: { title: string; route: string; href: string }[]
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
      { title: 'Alunos', route: 'web.escola.administrativo.alunos', href: '/escola/administrativo/alunos' },
      { title: 'Funcionários', route: 'web.escola.administrativo.funcionarios', href: '/escola/administrativo/funcionarios' },
      { title: 'Professores', route: 'web.escola.administrativo.professores', href: '/escola/administrativo/professores' },
      { title: 'Matrículas', route: 'web.escola.administrativo.matriculas', href: '/escola/administrativo/matriculas' },
      { title: 'Contratos', route: 'web.escola.administrativo.contratos', href: '/escola/administrativo/contratos' },
      { title: 'Bolsas', route: 'web.escola.administrativo.bolsas', href: '/escola/administrativo/bolsas' },
      { title: 'Parceiros', route: 'web.escola.administrativo.parceiros', href: '/escola/administrativo/parceiros' },
      { title: 'Matérias', route: 'web.escola.administrativo.materias', href: '/escola/administrativo/materias' },
      { title: 'Folha de Ponto', route: 'web.escola.administrativo.folhaDePonto', href: '/escola/administrativo/folha-de-ponto' },
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
      { title: 'Ocorrências', route: 'web.escola.pedagogico.ocorrencias', href: '/escola/pedagogico/ocorrencias' },
    ],
  },
  {
    title: 'Períodos Letivos',
    route: 'web.escola.periodosLetivos',
    href: '/escola/periodos-letivos',
    icon: Calendar,
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
      { title: 'Vendas', route: 'web.escola.cantina.vendas', href: '/escola/cantina/vendas' },
    ],
  },
  {
    title: 'Financeiro',
    route: 'web.escola.financeiro.mensalidades',
    href: '/escola/financeiro',
    icon: DollarSign,
    children: [
      { title: 'Mensalidades', route: 'web.escola.financeiro.mensalidades', href: '/escola/financeiro/mensalidades' },
      { title: 'Inadimplência', route: 'web.escola.financeiro.inadimplencia', href: '/escola/financeiro/inadimplencia' },
    ],
  },
  {
    title: 'Gamificação',
    route: 'web.escola.gamificacao.index',
    href: '/escola/gamificacao',
    icon: Trophy,
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
                className={cn(
                  'block rounded-lg px-3 py-2 text-sm transition-colors',
                  pathname === child.href
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {child.title}
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

export function EscolaLayout({ children }: PropsWithChildren) {
  const { props, url } = usePage<SharedProps>()
  const user = props.user
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = url.split('?')[0]

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <ImpersonationBanner />
      <div className="flex flex-1 overflow-hidden">
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
          <SchoolGroupSwitcher />

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {navigation.map((item) => {
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
                <p className="text-xs text-muted-foreground truncate">{formatRoleName(user?.role?.name)}</p>
              </div>
            </div>
            <Link
              route="api.v1.auth.logout"
              method="post"
              as="button"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full mt-3')}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Link>
          </div>
        </div>
      </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:pl-0">
          {/* Top bar */}
          <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
