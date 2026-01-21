import { Link, usePage } from '@inertiajs/react'
import type { PropsWithChildren } from 'react'
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
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import type { SharedProps } from '../../lib/types'
import { cn } from '../../lib/utils'
import { ImpersonationBanner } from '../admin/impersonation-banner'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
}

const navigation: NavItem[] = [
  { title: 'Início', href: '/responsavel', icon: LayoutDashboard },
  { title: 'Notas', href: '/responsavel/notas', icon: BookOpen },
  { title: 'Frequência', href: '/responsavel/frequencia', icon: Calendar },
  { title: 'Mensalidades', href: '/responsavel/mensalidades', icon: DollarSign },
  { title: 'Cantina', href: '/responsavel/cantina', icon: UtensilsCrossed },
  { title: 'Autorizações', href: '/responsavel/autorizacoes', icon: ClipboardCheck },
  { title: 'Documentos', href: '/responsavel/documentos', icon: FileText },
  { title: 'Gamificação', href: '/responsavel/gamificacao', icon: Trophy },
  { title: 'Comunicados', href: '/responsavel/comunicados', icon: Bell },
  { title: 'Perfil', href: '/responsavel/perfil', icon: User },
]

export function ResponsavelLayout({ children }: PropsWithChildren) {
  const { props, url } = usePage<SharedProps>()
  const user = props.user
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = url.split('?')[0]

  return (
    <div className="min-h-screen bg-background">
      <ImpersonationBanner />
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
            <Link href="/responsavel" className="flex items-center gap-2">
              <span className="font-bold text-lg text-primary">Anua</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Responsável</span>
            </Link>
            <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
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
          </nav>

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
