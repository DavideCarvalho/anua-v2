import { usePage } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import type { PropsWithChildren } from 'react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  LogOut,
  Store,
} from 'lucide-react'

import { ThemeToggle } from '../theme-toggle'
import type { SharedProps } from '../../lib/types'
import { formatRoleName } from '../../lib/formatters'
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
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '../ui/sidebar'
import { api } from '../../../.adonisjs/api'
import type { RouteName } from '@tuyau/client'

interface NavItem {
  title: string
  route: RouteName<typeof api.routes>
  href: string
  icon: React.ElementType
}

const navigation: NavItem[] = [
  { title: 'Dashboard', route: 'web.loja.dashboard', href: '/loja', icon: LayoutDashboard },
  { title: 'Produtos', route: 'web.loja.produtos', href: '/loja/produtos', icon: Package },
  { title: 'Pedidos', route: 'web.loja.pedidos', href: '/loja/pedidos', icon: ShoppingCart },
  { title: 'Financeiro', route: 'web.loja.financeiro', href: '/loja/financeiro', icon: Wallet },
]

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
              <Link route="web.loja.dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Store className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Minha Loja</span>
                  <span className="text-xs text-muted-foreground">Painel do lojista</span>
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
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link route={item.route as any} params={undefined as any}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {user?.name?.charAt(0).toUpperCase() || 'L'}
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium truncate">{user?.name}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {formatRoleName(user?.role?.name)}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

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

export function LojaLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
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
