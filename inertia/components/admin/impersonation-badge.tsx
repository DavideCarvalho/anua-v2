import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Shield, Eye, RefreshCw, Check, Search } from 'lucide-react'
import toast from 'react-hot-toast'

import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Input } from '../ui/input'
import { ScrollArea } from '../ui/scroll-area'
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '../ui/sidebar'
import { cn } from '../../lib/utils'

import { useImpersonationStatusQueryOptions } from '../../hooks/queries/use-impersonation-status'
import { useImpersonationConfigQueryOptions } from '../../hooks/queries/use-impersonation-config'
import { useSetImpersonation, useClearImpersonation } from '../../hooks/mutations/use-impersonation-mutations'

interface ImpersonationBadgeProps {
  roleName: string
}

// Traduções dos cargos
const ROLE_TRANSLATIONS: Record<string, string> = {
  SCHOOL_DIRECTOR: 'Diretor(a)',
  SCHOOL_COORDINATOR: 'Coordenador(a)',
  SCHOOL_ADMIN: 'Admin da Escola',
  SCHOOL_ADMINISTRATIVE: 'Administrativo',
  SCHOOL_TEACHER: 'Professor(a)',
  SCHOOL_CANTEEN: 'Cantina',
  TEACHER: 'Professor(a)',
  STUDENT: 'Aluno(a)',
  RESPONSIBLE: 'Responsável',
  STUDENT_RESPONSIBLE: 'Responsável de Aluno',
  SCHOOL_CHAIN_DIRECTOR: 'Diretor(a) de Rede',
  SCHOOL_CHAIN_COORDINATOR: 'Coordenador(a) de Rede',
  SCHOOL_CHAIN_ADMINISTRATIVE: 'Administrativo de Rede',
}

function translateRole(roleName: string): string {
  return ROLE_TRANSLATIONS[roleName] || roleName
}

export function ImpersonationBadge({ roleName }: ImpersonationBadgeProps) {
  const queryClient = useQueryClient()

  // State for user search and filters
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | undefined>()
  const [schoolFilter, setSchoolFilter] = useState<string | undefined>()
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>()
  const [page, setPage] = useState(1)

  // Check if currently impersonating
  const { data: impersonationStatus } = useQuery(useImpersonationStatusQueryOptions())

  const hasActiveImpersonation = impersonationStatus?.isImpersonating ?? false

  // Fetch users for impersonation
  const { data: config, isLoading } = useQuery(
    useImpersonationConfigQueryOptions({
      search: search || undefined,
      roleFilter: roleFilter === 'all' ? undefined : roleFilter,
      schoolFilter: schoolFilter === 'all' ? undefined : schoolFilter,
      page,
      limit: 20,
    })
  )

  // Mutations
  const setImpersonationMutation = useSetImpersonation()
  const clearImpersonationMutation = useClearImpersonation()

  const handleApplyImpersonation = async () => {
    if (!selectedUserId) {
      toast.error('Selecione um usuário')
      return
    }

    try {
      const data = await setImpersonationMutation.mutateAsync({
        userId: selectedUserId,
      })

      if (data?.success && data.impersonating) {
        toast.success(
          `Personificando: ${data.impersonating.name} (${translateRole(data.impersonating.role || '')})`
        )

        // Invalidate all queries to refetch with new context
        await queryClient.invalidateQueries()

        // Navigate based on role and reload (igual school-super-app)
        const role = data.impersonating.role || ''
        let redirectPath = '/escola' // Default para /escola

        // Responsáveis vão para /responsavel
        if (role === 'RESPONSIBLE' || role === 'STUDENT_RESPONSIBLE') {
          redirectPath = '/responsavel'
        }
        // Todos os outros (STUDENT, TEACHER, SCHOOL_*, SCHOOL_CHAIN_*) vão para /escola
        else if (
          role === 'STUDENT' ||
          role === 'TEACHER' ||
          role.startsWith('SCHOOL_') ||
          role.startsWith('SCHOOL_CHAIN_')
        ) {
          redirectPath = '/escola'
        }

        // Navigate and reload
        window.location.href = redirectPath
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao ativar personificação'
      toast.error(message)
    }
  }

  const handleClearImpersonation = async () => {
    try {
      await clearImpersonationMutation.mutateAsync()

      toast.success('Personificação desativada')

      await queryClient.invalidateQueries()

      // Volta para o admin dashboard (igual school-super-app)
      window.location.href = '/admin'
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao desativar personificação'
      toast.error(message)
    }
  }

  const selectedUser = config?.users?.find((u) => u.id === selectedUserId)

  // Show badge when user is ADMIN/SUPER_ADMIN or has active impersonation
  const shouldShow = ['ADMIN', 'SUPER_ADMIN'].includes(roleName) || hasActiveImpersonation

  if (!shouldShow) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={hasActiveImpersonation ? 'Personificação Ativa' : 'Personificar Usuário'}
              className={cn(
                hasActiveImpersonation && 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50'
              )}
            >
              <div
                className={cn(
                  'flex aspect-square size-8 items-center justify-center rounded-lg',
                  hasActiveImpersonation ? 'bg-amber-500 text-white' : 'bg-primary/10 text-primary'
                )}
              >
                <Shield className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">
                  {hasActiveImpersonation ? 'Personificação Ativa' : 'Personificar'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {hasActiveImpersonation ? 'Clique para gerenciar' : 'Ver como outro usuário'}
                </span>
              </div>
              {hasActiveImpersonation && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[400px] p-4" align="start" side="right" sideOffset={8}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-amber-500" />
              <Label className="text-sm font-semibold">Personificar Usuário</Label>
            </div>
            {hasActiveImpersonation && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-700">
                Ativa
              </Badge>
            )}
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar usuário</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Nome ou email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
          </div>

          {/* Filters - igual school-super-app */}
          <div className="grid grid-cols-2 gap-2">
            {/* Filter by role */}
            <div className="space-y-2">
              <Label htmlFor="role-filter">Filtrar por cargo</Label>
              <Select
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter(value)
                  setPage(1)
                }}
              >
                <SelectTrigger id="role-filter">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os cargos</SelectItem>
                  {config?.availableRoles?.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {translateRole(role.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter by school */}
            <div className="space-y-2">
              <Label htmlFor="school-filter">Filtrar por escola</Label>
              <Select
                value={schoolFilter}
                onValueChange={(value) => {
                  setSchoolFilter(value)
                  setPage(1)
                }}
              >
                <SelectTrigger id="school-filter">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as escolas</SelectItem>
                  {config?.availableSchools?.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* User list */}
          <div className="space-y-2">
            <Label>Selecione um usuário</Label>
            <ScrollArea className="h-[200px] rounded-lg border">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Carregando...</div>
              ) : !config?.users?.length ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhum usuário encontrado
                </div>
              ) : (
                <div className="p-2">
                  {config.users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUserId(user.id)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md p-3 text-left transition-colors hover:bg-accent',
                        selectedUserId === user.id && 'bg-accent ring-2 ring-primary'
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email} • {translateRole(user.role || '')}
                          {user.school && ` • ${user.school}`}
                        </span>
                      </div>
                      {selectedUserId === user.id && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Pagination */}
            {config && config.meta && config.meta.lastPage > 1 && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Página {config.meta.currentPage} de {config.meta.lastPage}
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={config.meta.currentPage === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={config.meta.currentPage === config.meta.lastPage}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Selected user info */}
          {selectedUser && (
            <div className="rounded-lg bg-muted p-3">
              <div className="text-sm font-medium">Usuário selecionado:</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {selectedUser.name} ({translateRole(selectedUser.role || '')})
                {selectedUser.school && ` - ${selectedUser.school}`}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {hasActiveImpersonation ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleClearImpersonation}
                  disabled={clearImpersonationMutation.isPending}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Desativar
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={handleApplyImpersonation}
                  disabled={!selectedUserId || setImpersonationMutation.isPending}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Trocar Usuário
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={handleApplyImpersonation}
                disabled={!selectedUserId || setImpersonationMutation.isPending}
              >
                <Eye className="mr-2 h-4 w-4" />
                Aplicar e Recarregar
              </Button>
            )}
          </div>
        </div>
      </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
