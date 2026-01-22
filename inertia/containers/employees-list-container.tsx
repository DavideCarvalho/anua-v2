import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useQueryStates, parseAsInteger, parseAsString, parseAsArrayOf } from 'nuqs'
import { useSchoolEmployeesQueryOptions } from '../hooks/queries/use-school-employees'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover'
import { Checkbox } from '../components/ui/checkbox'
import { formatRoleName } from '../lib/formatters'
import {
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  UserCog,
  MoreHorizontal,
  Plus,
  X,
  ChevronDown,
} from 'lucide-react'

const EMPLOYEE_ROLES = [
  { value: 'SCHOOL_DIRECTOR', label: 'Diretor' },
  { value: 'SCHOOL_COORDINATOR', label: 'Coordenador' },
  { value: 'SCHOOL_ADMIN', label: 'Administrador Escolar' },
  { value: 'SCHOOL_ADMINISTRATIVE', label: 'Administrativo' },
  { value: 'SCHOOL_TEACHER', label: 'Professor' },
  { value: 'SCHOOL_CANTEEN', label: 'Cantina' },
]

// Loading Skeleton
function EmployeesListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="p-4 border-b last:border-0">
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-4 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Error Fallback
function EmployeesListError({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex items-center gap-4 py-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="flex-1">
          <h3 className="font-semibold text-destructive">Erro ao carregar funcionários</h3>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Ocorreu um erro inesperado'}
          </p>
        </div>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}

// Content Component
function EmployeesListContent({
  search,
  roles,
  status,
  page,
  onPageChange,
}: {
  search: string | null
  roles: string[] | null
  status: string | null
  page: number
  onPageChange: (page: number) => void
}) {
  const { data, isLoading } = useQuery(
    useSchoolEmployeesQueryOptions({
      page,
      limit: 20,
      search: search || undefined,
      roles: roles && roles.length > 0 ? roles : undefined,
      status: status || undefined,
    })
  )

  if (isLoading) {
    return <EmployeesListSkeleton />
  }

  const users = Array.isArray(data) ? data : data?.data || []
  const meta = !Array.isArray(data) && data?.meta ? data.meta : null

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Nenhum funcionário encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search || (roles && roles.length > 0) || status
              ? 'Tente ajustar os filtros de busca'
              : 'Cadastre o primeiro funcionário'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">Nome</th>
              <th className="text-left p-4 font-medium">Email</th>
              <th className="text-left p-4 font-medium">Cargo</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-right p-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{user.email || '-'}</td>
                <td className="p-4">{formatRoleName(user.role?.name)}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {users.length} de {meta.total} funcionários
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {page} de {meta.lastPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.lastPage}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Container Export
export function EmployeesListContainer() {
  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    roles: parseAsArrayOf(parseAsString),
    status: parseAsString,
    page: parseAsInteger.withDefault(1),
  })

  const { search, roles, status, page } = filters
  const hasFilters = search || (roles && roles.length > 0) || status

  const clearFilters = () => {
    setFilters({ search: null, roles: null, status: null, page: 1 })
  }

  const toggleRole = (roleValue: string) => {
    const currentRoles = roles || []
    const newRoles = currentRoles.includes(roleValue)
      ? currentRoles.filter((r) => r !== roleValue)
      : [...currentRoles, roleValue]
    setFilters({ roles: newRoles.length > 0 ? newRoles : null, page: 1 })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            className="pl-9"
            value={search || ''}
            onChange={(e) => {
              setFilters({ search: e.target.value || null, page: 1 })
            }}
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-between">
              {roles && roles.length > 0 ? (
                <span className="truncate">
                  {roles.length === 1
                    ? EMPLOYEE_ROLES.find((r) => r.value === roles[0])?.label
                    : `${roles.length} cargos`}
                </span>
              ) : (
                <span className="text-muted-foreground">Cargo</span>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2" align="start">
            <div className="space-y-1">
              {EMPLOYEE_ROLES.map((r) => (
                <label
                  key={r.value}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-muted"
                >
                  <Checkbox
                    checked={roles?.includes(r.value) || false}
                    onCheckedChange={() => toggleRole(r.value)}
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Select
          value={status || 'all'}
          onValueChange={(value) => {
            setFilters({ status: value === 'all' ? null : value, page: 1 })
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpar filtros
          </Button>
        )}

        <Button className="ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Funcionário
        </Button>
      </div>

      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ error, resetErrorBoundary }) => (
              <EmployeesListError error={error} resetErrorBoundary={resetErrorBoundary} />
            )}
          >
            <EmployeesListContent
              search={search}
              roles={roles}
              status={status}
              page={page}
              onPageChange={(p) => setFilters({ page: p })}
            />
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </div>
  )
}
