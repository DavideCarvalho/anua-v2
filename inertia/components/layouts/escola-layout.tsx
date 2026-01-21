import { Link, usePage } from '@inertiajs/react'
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
import { ImpersonationBanner } from '../admin/impersonation-banner'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  children?: { title: string; href: string }[]
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/escola',
    icon: LayoutDashboard,
  },
  {
    title: 'Administrativo',
    href: '/escola/administrativo',
    icon: Users,
    children: [
      { title: 'Alunos', href: '/escola/administrativo/alunos' },
      { title: 'Funcionários', href: '/escola/administrativo/funcionarios' },
      { title: 'Professores', href: '/escola/administrativo/professores' },
      { title: 'Matrículas', href: '/escola/administrativo/matriculas' },
      { title: 'Contratos', href: '/escola/administrativo/contratos' },
      { title: 'Bolsas', href: '/escola/administrativo/bolsas' },
      { title: 'Parceiros', href: '/escola/administrativo/parceiros' },
      { title: 'Matérias', href: '/escola/administrativo/materias' },
      { title: 'Folha de Ponto', href: '/escola/administrativo/folha-de-ponto' },
    ],
  },
  {
    title: 'Pedagógico',
    href: '/escola/pedagogico',
    icon: BookOpen,
    children: [
      { title: 'Turmas', href: '/escola/pedagogico/turmas' },
      { title: 'Grade', href: '/escola/pedagogico/grade' },
      { title: 'Ocorrências', href: '/escola/pedagogico/ocorrencias' },
    ],
  },
  {
    title: 'Períodos Letivos',
    href: '/escola/periodos-letivos',
    icon: Calendar,
  },
  {
    title: 'Cantina',
    href: '/escola/cantina',
    icon: UtensilsCrossed,
    children: [
      { title: 'PDV', href: '/escola/cantina/pdv' },
      { title: 'Itens', href: '/escola/cantina/itens' },
      { title: 'Cardápio', href: '/escola/cantina/cardapio' },
      { title: 'Vendas', href: '/escola/cantina/vendas' },
    ],
  },
  {
    title: 'Financeiro',
    href: '/escola/financeiro',
    icon: DollarSign,
    children: [
      { title: 'Mensalidades', href: '/escola/financeiro/mensalidades' },
      { title: 'Inadimplência', href: '/escola/financeiro/inadimplencia' },
    ],
  },
  {
    title: 'Gamificação',
    href: '/escola/gamificacao',
    icon: Trophy,
  },
  {
    title: 'Configurações',
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
                key={child.href}
                href={child.href}
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
      href={item.href}
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
    <div className="min-h-screen bg-background">
      <ImpersonationBanner />
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
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/escola" className="flex items-center gap-2">
              <School className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Anua</span>
            </Link>
            <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* School info */}
          {user?.school && (
            <div className="border-b px-4 py-3">
              <p className="text-sm font-medium truncate">{user.school.name}</p>
              <p className="text-xs text-muted-foreground">{user.role?.name}</p>
            </div>
          )}

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
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Link
              href="/api/v1/auth/logout"
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
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
