import { Link, usePage } from '@inertiajs/react'
import type { PropsWithChildren } from 'react'
import {
  LayoutDashboard,
  Building2,
  Network,
  BarChart3,
  CreditCard,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import type { SharedProps } from '../../lib/types'
import { cn } from '../../lib/utils'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  children?: { title: string; href: string }[]
}

const navigation: NavItem[] = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Escolas', href: '/admin/escolas', icon: Building2 },
  { title: 'Redes', href: '/admin/redes', icon: Network },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    children: [
      { title: 'Acadêmico', href: '/admin/analytics/academico' },
      { title: 'Cantinas', href: '/admin/analytics/cantinas' },
      { title: 'Gamificação', href: '/admin/analytics/gamificacao' },
      { title: 'Matrículas', href: '/admin/analytics/matriculas' },
      { title: 'Pagamentos', href: '/admin/analytics/pagamentos' },
      { title: 'Presença', href: '/admin/analytics/presenca' },
    ],
  },
  {
    title: 'Billing',
    href: '/admin/billing',
    icon: CreditCard,
    children: [
      { title: 'Dashboard', href: '/admin/billing/dashboard' },
      { title: 'Faturas', href: '/admin/billing/invoices' },
      { title: 'Assinaturas', href: '/admin/billing/subscriptions' },
    ],
  },
  { title: 'Seguros', href: '/admin/seguros', icon: Shield },
  { title: 'Configurações', href: '/admin/configuracoes', icon: Settings },
]

function NavItemComponent({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = pathname === item.href || item.children?.some((c) => pathname === c.href)
  const [isOpen, setIsOpen] = useState(isActive)
  const Icon = item.icon

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
            {item.children.map((child) => (
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
        pathname === item.href ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      {item.title}
    </Link>
  )
}

export function AdminLayout({ children }: PropsWithChildren) {
  const { props, url } = usePage<SharedProps>()
  const user = props.user
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = url.split('?')[0]

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="font-bold text-lg text-primary">Anua</span>
              <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded">Admin</span>
            </Link>
            <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {navigation.map((item) => (
                <NavItemComponent key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          </nav>

          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.role?.name}</p>
              </div>
            </div>
            <Link href="/api/v1/auth/logout" method="post" as="button" className="w-full mt-3">
              <Button variant="outline" size="sm" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
