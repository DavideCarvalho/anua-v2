import { usePage } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import type { PropsWithChildren } from 'react'
import { PostHogProvider } from '../posthog-provider'
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
} from '../ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
import { api } from '../../../.adonisjs/api'
import type { RouteName } from '@tuyau/client'

interface NavItem {
  title: string
  route: RouteName<typeof api.routes>
  href: string
  icon: React.ElementType
  children?: { title: string; route: RouteName<typeof api.routes>; href: string }[]
}

const navigation: NavItem[] = [
  { title: 'Dashboard', route: 'web.admin.dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Escolas', route: 'web.admin.escolas', href: '/admin/escolas', icon: Building2 },
  { title: 'Redes', route: 'web.admin.redes', href: '/admin/redes', icon: Network },
  {
    title: 'Analytics',
    route: 'web.admin.analytics.index',
    href: '/admin/analytics',
    icon: BarChart3,
    children: [
      { title: 'Acadêmico', route: 'web.admin.analytics.academico', href: '/admin/analytics/academico' },
      { title: 'Presença', route: 'web.admin.analytics.presenca', href: '/admin/analytics/presenca' },
      { title: 'Cantina', route: 'web.admin.analytics.cantina', href: '/admin/analytics/cantina' },
      { title: 'Pagamentos', route: 'web.admin.analytics.pagamentos', href: '/admin/analytics/pagamentos' },
      { title: 'Matrículas', route: 'web.admin.analytics.matriculas', href: '/admin/analytics/matriculas' },
      { title: 'Ocorrências', route: 'web.admin.analytics.ocorrencias', href: '/admin/analytics/ocorrencias' },
      { title: 'Gamificação', route: 'web.admin.analytics.gamificacao', href: '/admin/analytics/gamificacao' },
      { title: 'RH', route: 'web.admin.analytics.rh', href: '/admin/analytics/rh' },
    ],
  },
  {
    title: 'Billing',
    route: 'web.admin.billing.dashboard',
    href: '/admin/billing',
    icon: CreditCard,
    children: [
      { title: 'Dashboard', route: 'web.admin.billing.dashboard', href: '/admin/billing/dashboard' },
      { title: 'Assinaturas', route: 'web.admin.billing.subscriptions', href: '/admin/billing/subscriptions' },
    ],
  },
  { title: 'Seguros', route: 'web.admin.seguros.index', href: '/admin/seguros', icon: Shield },
  { title: 'Configurações', route: 'web.admin.configuracoes', href: '/admin/configuracoes', icon: Settings },
]

function NavItemWithChildren({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = item.children?.some((c) => pathname === c.href)
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
              <SidebarMenuSubItem key={child.route}>
                <SidebarMenuSubButton asChild isActive={pathname === child.href}>
                  <Link route={child.route as any} params={undefined as any}>{child.title}</Link>
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
        <Link route={item.route as any} params={undefined as any}>
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
              <Link route="web.admin.dashboard">
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
        <Link
          route="api.v1.auth.logout"
          className="inline-flex w-full items-center justify-start gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </Link>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export function AdminLayout({ children }: PropsWithChildren) {
  return (
    <PostHogProvider>
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
    </PostHogProvider>
  )
}
