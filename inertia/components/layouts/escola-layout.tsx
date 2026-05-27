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
  ChevronDown,
  School,
  Megaphone,
  // Bot, // descomenta junto com o nav item "Assistente IA"
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { buttonVariants } from '../ui/button'
import { api } from '~/lib/api'
import type { SharedProps } from '../../lib/types'
import { cn, ClientOnly } from '../../lib/utils'
import { formatRoleName } from '../../lib/formatters'
import { ImpersonationBanner } from '../admin/impersonation-banner'
import { SidebarAcademicPeriods } from '../sidebar/sidebar-academic-periods'
import { SchoolGroupSwitcher } from '../sidebar/school-group-switcher'
import { NotificationBell } from '../notifications/notification-bell'
import { ChangelogButton } from '../changelog/changelog-button'
import { useAuthUser } from '../../stores/auth_store'
import { registry } from '@generated/registry/index'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { AnimatePresence, motion } from 'framer-motion'

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
        title: 'Chat',
        route: 'web.escola.chat',
        href: '/escola/chat',
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
  // TEMP: escondido da sidebar enquanto o feature tá em validação. A rota
  // /escola/ia continua acessível por URL direta (e o teacher_scope
  // middleware permite). Quando for liberar pra todos, descomenta e
  // restaura o filter especial pro teacher na visibleNavigation abaixo.
  // {
  //   title: 'Assistente IA',
  //   route: 'web.escola.ia.index',
  //   href: '/escola/ia',
  //   icon: Bot,
  // },
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

function NavItemWithChildren({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = item.children?.some((child) => pathname === child.href) ?? false
  return (
    <Collapsible defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            title={item.title}
            className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm text-foreground ring-sidebar-ring outline-hidden transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-2 [&>svg]:size-4 [&>svg]:shrink-0"
          >
            <item.icon className="h-4 w-4" />
            <span className="truncate">{item.title}</span>
            <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((child) => (
              <SidebarMenuSubItem key={child.href}>
                <SidebarMenuSubButton asChild isActive={pathname === child.href}>
                  <Link route={child.route} routeParams={undefined}>
                    <span className="truncate">{child.title}</span>
                    {child.badge ? <span className="ml-auto">{child.badge}</span> : null}
                  </Link>
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
        <Link route={item.route} routeParams={undefined}>
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function EscolaSidebar() {
  const { url } = usePage<SharedProps>()
  const user = useAuthUser()
  const pathname = url.split('?')[0]
  const isSchoolTeacher = user?.role?.name === 'SCHOOL_TEACHER' || user?.role?.name === 'TEACHER'
  const visibleNavigation = isSchoolTeacher
    ? navigation.filter((item) => item.title === 'Pedagógico')
    : navigation

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Anua">
              <Link route="web.escola.dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <School className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold text-lg">Anua</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="group-data-[collapsible=icon]:hidden">
          <ClientOnly
            fallback={
              <div className="border-b px-4 py-3">
                <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
              </div>
            }
          >
            <SchoolGroupSwitcher />
          </ClientOnly>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavigation.map((item) =>
                item.children && item.children.length > 0 ? (
                  <NavItemWithChildren key={item.href} item={item} pathname={pathname} />
                ) : (
                  <NavItemSimple key={item.href} item={item} pathname={pathname} />
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-2 border-t pt-2 group-data-[collapsible=icon]:hidden">
          <SidebarAcademicPeriods />
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="flex w-full items-center gap-3 rounded-md p-2 group-data-[collapsible=icon]:p-0">
          <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {formatRoleName(user?.role?.name)}
            </p>
          </div>
        </div>
        <Link
          route="api.v1.auth.logout"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'w-full justify-start group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0'
          )}
          title="Sair"
        >
          <LogOut className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-2" />
          <span className="group-data-[collapsible=icon]:hidden">Sair</span>
        </Link>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

function UnreadMessagesBadge() {
  // Fetches up to 50 inquiries to get a meaningful unread count for the badge.
  const { data } = useQuery(
    api.api.v1.escola.inquiries.inquiries.list.queryOptions({ query: { limit: 50 } })
  )

  const count = data?.data?.filter((i) => i.hasUnread).length ?? 0
  if (count === 0) return null

  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
      {count > 99 ? '99+' : count}
    </span>
  )
}

type EscolaLayoutProps = PropsWithChildren<{
  topbarActions?: ReactNode
  /**
   * Painel inline à direita do main em telas md+. Empurra o conteúdo invés
   * de sobrepor. Em mobile, esconde — quem chama deve usar Sheet bottom.
   */
  rightPane?: ReactNode
}>

function readSidebarCookie(): boolean {
  if (typeof document === 'undefined') return true
  const match = document.cookie.match(/(?:^|; )sidebar_state=([^;]*)/)
  if (!match) return true
  return match[1] === 'true'
}

export function EscolaLayout({ children, topbarActions, rightPane }: EscolaLayoutProps) {
  // SidebarProvider só usa defaultOpen no primeiro render — depois ele controla
  // estado próprio e grava cookie no toggle. SSR sempre vê `true` (sem document),
  // então hidratamos a partir do cookie via useEffect e passamos open/onOpenChange
  // pra evitar mismatch e ainda assim respeitar o estado salvo.
  const [open, setOpen] = useState<boolean>(true)

  useEffect(() => {
    setOpen(readSidebarCookie())
  }, [])

  return (
    <PostHogProvider>
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <EscolaSidebar />
        <SidebarInset className="flex h-screen min-h-0 flex-col overflow-hidden">
          <ImpersonationBanner />
          <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <div
              data-testid="escola-layout-topbar-actions"
              className="ml-auto flex items-center gap-2"
            >
              {topbarActions}
              <ChangelogButton audience="escola" />
              <NotificationBell allNotificationsRoute="web.escola.notificacoes" />
            </div>
          </header>
          <div className="flex min-h-0 flex-1">
            <main className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
            <AnimatePresence initial={false}>
              {rightPane ? (
                <motion.aside
                  key="escola-right-pane"
                  // Inner div trava a largura em 480px pra que o conteúdo
                  // não reflue enquanto a aside externa anima 0→480; outer
                  // overflow-hidden clipa durante a transição.
                  className="hidden shrink-0 flex-col overflow-hidden border-l bg-card md:flex"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 480, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex h-full w-[480px] flex-col">{rightPane}</div>
                </motion.aside>
              ) : null}
            </AnimatePresence>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </PostHogProvider>
  )
}
