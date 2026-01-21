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
  ChevronDown,
} from 'lucide-react'

import { Button } from '../ui/button'
import { ThemeToggle } from '../theme-toggle'
import type { SharedProps } from '../../lib/types'
import { formatRoleName } from '../../lib/formatters'
import { ImpersonationBadge } from '../admin/impersonation-badge'
import { ImpersonationBanner } from '../admin/impersonation-banner'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '../ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'

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
      { title: 'Presença', href: '/admin/analytics/presenca' },
      { title: 'Cantina', href: '/admin/analytics/cantina' },
      { title: 'Pagamentos', href: '/admin/analytics/pagamentos' },
      { title: 'Matrículas', href: '/admin/analytics/matriculas' },
      { title: 'Ocorrências', href: '/admin/analytics/ocorrencias' },
      { title: 'Gamificação', href: '/admin/analytics/gamificacao' },
      { title: 'RH', href: '/admin/analytics/rh' },
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

function NavItemWithChildren({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = item.children?.some((c) => pathname === c.href)
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <Collapsible defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((child) => (
              <SidebarMenuSubItem key={child.href}>
                <SidebarMenuSubButton asChild isActive={pathname === child.href}>
                  <Link href={child.href}>{child.title}</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function NavItemSimple({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = pathname === item.href

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <Link href={item.href}>
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function AppSidebar() {
  const { props, url } = usePage<SharedProps>()
  const user = props.user
  const pathname = url.split('?')[0]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  A
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Anua</span>
                  <span className="text-xs text-red-500">Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) =>
                item.children ? (
                  <NavItemWithChildren key={item.href} item={item} pathname={pathname} />
                ) : (
                  <NavItemSimple key={item.href} item={item} pathname={pathname} />
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        {/* Impersonation Badge */}
        <ImpersonationBadge roleName={user?.role?.name || ''} />

        {/* User info */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium truncate">{user?.name}</span>
                <span className="text-xs text-muted-foreground truncate">{formatRoleName(user?.role?.name)}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Logout */}
        <Link href="/api/v1/auth/logout" method="post" as="button" className="w-full">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </Button>
        </Link>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export function AdminLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Banner de impersonation - z-index alto para ficar acima de tudo */}
        <ImpersonationBanner />

        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          <ThemeToggle />
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
