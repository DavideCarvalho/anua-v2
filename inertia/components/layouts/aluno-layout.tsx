import { usePage } from '@inertiajs/react'
import { cn } from '../../lib/utils'
import { Link } from '@adonisjs/inertia/react'
import type { PropsWithChildren } from 'react'
import {
  Home,
  ShoppingBag,
  ShoppingCart,
  ClipboardList,
  LogOut,
  Sparkles,
  Star,
  Gem,
  Coins,
  Gamepad2,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { ThemeToggle } from '../theme-toggle'
import type { SharedProps } from '../../lib/types'
import { formatRoleName } from '../../lib/formatters'
import { CartProvider, useCart } from '../../contexts/cart-context'
import { useAuthUser } from '../../stores/auth_store'
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
import { registry } from '~/generated/registry'
import { DiceBearAvatar } from '../avatar/dicebear-avatar'

interface NavItem {
  title: string
  route: keyof typeof registry.routes
  href: string
  icon: React.ElementType
}

const navigation: NavItem[] = [
  { title: 'Início', route: 'web.aluno.dashboard' as any, href: '/aluno', icon: Home },
  {
    title: 'Loja de Pontos',
    route: 'web.aluno.loja.pontos' as any,
    href: '/aluno/loja/pontos',
    icon: Sparkles,
  },
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
  { title: 'Idle', route: 'web.aluno.idle' as any, href: '/aluno/idle', icon: Gamepad2 },
]

const gamifiedNavigation: NavItem[] = [
  { title: 'Meu Cantinho', route: 'web.aluno.dashboard' as any, href: '/aluno', icon: Home },
  {
    title: 'Baú',
    route: 'web.aluno.loja.pontos' as any,
    href: '/aluno/loja/pontos',
    icon: Gem,
  },
  { title: 'Idle', route: 'web.aluno.idle' as any, href: '/aluno/idle', icon: Gamepad2 },
  {
    title: 'Mercadinho',
    route: 'web.aluno.loja.index' as any,
    href: '/aluno/loja',
    icon: ShoppingBag,
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
  const { url, props } = usePage<SharedProps>()
  const user = useAuthUser()
  const pathname = url.split('?')[0]
  const gamified = props.gamified ?? false

  return (
    <Sidebar
      collapsible="icon"
      className={cn(gamified && 'border-r-amber-200/50 dark:border-amber-900/30')}
    >
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link route={'web.aluno.dashboard' as any} params={undefined as any}>
                <div
                  className={cn(
                    'flex aspect-square size-8 items-center justify-center rounded-lg text-primary-foreground',
                    gamified ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-primary'
                  )}
                >
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

function GamifiedHeader({ className }: { className?: string }) {
  const { props } = usePage<SharedProps>()
  const user = useAuthUser()
  const avatarData = props.avatarData
  const gamificationData = props.gamificationData
  const firstName = user?.name?.split(' ')[0] ?? 'Aluno'

  return (
    <header
      className={cn(
        'flex h-16 shrink-0 items-center gap-3 border-b border-gf-primary/20 bg-gradient-to-r from-gf-primary-light to-gf-secondary-light px-4 dark:border-gf-primary-dark/40 dark:from-gf-navy dark:to-gf-primary-dark/20',
        className
      )}
    >
      <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gf-primary/40 bg-white shadow-md dark:border-gf-primary/30 dark:bg-gf-navy">
        {avatarData ? (
          <DiceBearAvatar
            skinTone={avatarData.skinTone}
            hairStyle={avatarData.hairStyle}
            hairColor={avatarData.hairColor}
            outfit={avatarData.outfit}
            accessories={avatarData.accessories}
            variant="compact"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gf-primary-light text-lg font-bold text-gf-primary dark:bg-gf-primary-dark/50 dark:text-gf-primary-light">
            {user?.name?.charAt(0).toUpperCase() ?? 'A'}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg font-bold text-gf-primary-dark dark:text-gf-primary-light">
          Olá, {firstName}!
        </p>
        <div className="flex items-center gap-2">
          {gamificationData && (
            <>
              <span className="flex items-center gap-1 rounded-full bg-gf-gold/20 px-2 py-0.5 text-xs font-bold text-gf-gold-dark dark:bg-gf-gold-dark/20">
                <Coins className="size-3" />
                {gamificationData.totalPoints}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-gf-primary/10 px-2 py-0.5 text-xs font-bold text-gf-primary dark:bg-gf-primary/20">
                <Star className="size-3 fill-gf-primary" />
                Nv.{gamificationData.currentLevel}
              </span>
            </>
          )}
        </div>
      </div>
      <ThemeToggle />
    </header>
  )
}

function GamifiedBottomNav() {
  const { url } = usePage<SharedProps>()
  const pathname = url.split('?')[0]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gf-primary/10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-gf-primary-dark/30 dark:bg-gf-navy/95 dark:supports-[backdrop-filter]:dark:bg-gf-navy/80 lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-1.5">
        {gamifiedNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 transition-all font-body',
                isActive
                  ? 'bg-gf-primary/15 text-gf-primary dark:bg-gf-primary/25 dark:text-gf-primary-light'
                  : 'text-muted-foreground hover:bg-gf-primary/5 hover:text-gf-primary'
              )}
            >
              <span className="relative inline-block">
                <item.icon className="size-5" />
              </span>
              <span className="text-[10px] font-semibold">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function AlunoLayoutContent({ children }: PropsWithChildren) {
  const { url, props } = usePage<SharedProps>()
  const gamified = props.gamified ?? false
  const pathname = url.split('?')[0]

  if (gamified) {
    return (
      <div className="gamified dark:gamified relative flex min-h-screen flex-col bg-gf-cream font-body dark:bg-gf-navy">
        <GamifiedHeader className="relative z-10" />
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="relative z-0 flex min-h-0 flex-1 flex-col"
          >
            {children}
          </motion.main>
        </AnimatePresence>
        <GamifiedBottomNav />
      </div>
    )
  }

  return (
    <SidebarInset>
      <header
        className={cn('flex h-14 shrink-0 items-center gap-2 border-b px-4', 'border-border')}
      >
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1" />
        <ThemeToggle />
      </header>

      <main className="flex-1 p-4 lg:p-6">{children}</main>
    </SidebarInset>
  )
}

export function AlunoLayout({ children }: PropsWithChildren) {
  const { props } = usePage<SharedProps>()
  const gamified = props.gamified ?? false

  return (
    <CartProvider>
      {gamified ? (
        <AlunoLayoutContent>{children}</AlunoLayoutContent>
      ) : (
        <SidebarProvider>
          <AppSidebar />
          <AlunoLayoutContent>{children}</AlunoLayoutContent>
        </SidebarProvider>
      )}
    </CartProvider>
  )
}
