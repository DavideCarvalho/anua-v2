import { usePage } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import type { PropsWithChildren } from 'react'
import { ShoppingBag, ShoppingCart, ClipboardList, LogOut } from 'lucide-react'

import { ThemeToggle } from '../theme-toggle'
import type { SharedProps } from '../../lib/types'
import { formatRoleName } from '../../lib/formatters'
import { CartProvider, useCart } from '../../contexts/cart-context'
import { Badge } from '../ui/badge'
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
  { title: 'Loja', route: 'web.aluno.loja.index' as any, href: '/aluno/loja', icon: ShoppingBag },
  {
    title: 'Carrinho',
    route: 'web.aluno.loja.carrinho' as any,
    href: '/aluno/loja/carrinho',
    icon: ShoppingCart,
  },
  {
    title: 'Meus Pedidos',
    route: 'web.aluno.loja.pedidos' as any,
    href: '/aluno/loja/pedidos',
    icon: ClipboardList,
  },
]

function CartBadge() {
  const { totalItems } = useCart()
  if (totalItems <= 0) return null
  return (
    <Badge variant="default" className="ml-auto h-5 min-w-5 justify-center px-1.5">
      {totalItems}
    </Badge>
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
              <Link route={'web.aluno.loja.index' as any} params={undefined as any}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  A
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Anua</span>
                  <span className="text-xs text-muted-foreground">Aluno</span>
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
                        {item.icon === ShoppingCart && <CartBadge />}
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
        {/* User info */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
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

export function AlunoLayout({ children }: PropsWithChildren) {
  return (
    <CartProvider>
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
    </CartProvider>
  )
}
