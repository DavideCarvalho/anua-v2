import { useEffect, useMemo, useState } from 'react'
import {
  useMutation,
  useQuery,
  QueryErrorResetBoundary,
  useQueryClient,
} from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { router } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import { useContractsQueryOptions, type ContractsResponse } from '../hooks/queries/use_contracts'
import { useAcademicPeriodsQueryOptions } from '../hooks/queries/use_academic_periods'
import { updateContractMutationOptions } from '../hooks/mutations/use_contract_mutations'
import { tuyau } from '../lib/api'
import { toast } from 'sonner'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import {
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  MoreHorizontal,
  Edit,
  RefreshCw,
  Filter,
  X,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'

interface ContractItem {
  id: string
  name: string
  description?: string
  enrollmentValue?: number
  enrollmentValueInstallments?: number
  amount?: number
  paymentType?: 'MONTHLY' | 'UPFRONT'
  installments?: number
  flexibleInstallments?: boolean
  isActive?: boolean
}

interface CourseLevel {
  id: string
  levelId: string
  name: string
  classes: { id: string; name: string }[]
}

interface AcademicPeriodCourse {
  id: string
  courseId: string
  name: string
  levels: CourseLevel[]
}

type ContractsMeta = ContractsResponse extends { meta: infer T } ? T : null

// Loading Skeleton
function ContractsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        <div className="h-10 w-32 bg-muted animate-pulse rounded ml-auto" />
      </div>
      <div className="border rounded-lg">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="p-4 border-b last:border-0">
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="h-4 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Error Fallback (for ErrorBoundary)
function ContractsListErrorFallback({
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
          <h3 className="font-semibold text-destructive">Erro ao carregar contratos</h3>
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

function formatCurrency(valueInCents: number | null | undefined): string {
  if (valueInCents == null) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueInCents / 100)
}

function getInstallmentsLabel(contract: ContractItem): string {
  if (contract.paymentType === 'MONTHLY') return 'Mensal'
  if (contract.flexibleInstallments) return 'Flexível'
  if (typeof contract.installments === 'number' && contract.installments > 0) {
    return `${contract.installments}x`
  }
  return '-'
}

function getTuitionLabel(contract: ContractItem): string {
  const valueLabel = formatCurrency(contract.amount)
  const installmentsLabel = getInstallmentsLabel(contract)

  if (installmentsLabel === '-' || installmentsLabel === 'Mensal') {
    return `${valueLabel} (mensal)`
  }

  if (installmentsLabel === 'Flexível') {
    return `${valueLabel} (à vista - parcelas flexíveis)`
  }

  return `${valueLabel} (à vista - ${installmentsLabel})`
}

function getEnrollmentLabel(contract: ContractItem): string {
  const valueLabel = formatCurrency(contract.enrollmentValue)

  if (!contract.enrollmentValue || contract.enrollmentValue <= 0) {
    return valueLabel
  }

  const installments = contract.enrollmentValueInstallments ?? 1
  if (installments <= 1) {
    return valueLabel
  }

  return `${valueLabel} (em até ${installments}x)`
}

// Container Export
export function ContractsListContainer() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <ContractsListErrorFallback
              error={error as Error}
              resetErrorBoundary={resetErrorBoundary}
            />
          )}
        >
          <ContractsListContent />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

function ContractsListContent() {
  const queryClient = useQueryClient()
  // URL state with nuqs
  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    academicPeriodId: parseAsString,
    courseId: parseAsString,
    classId: parseAsString,
    status: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  })

  const { search, academicPeriodId, courseId, classId, status, page, limit } = filters
  const [searchInput, setSearchInput] = useState(search || '')

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchInput || null, page: 1 })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, setFilters])

  useEffect(() => {
    setSearchInput(search || '')
  }, [search])

  const statusFilter = status || 'active'

  const hasActiveFilters =
    !!search || !!academicPeriodId || !!courseId || !!classId || statusFilter !== 'active'

  const clearFilters = () => {
    setFilters({
      search: null,
      academicPeriodId: null,
      courseId: null,
      classId: null,
      status: null,
      page: 1,
    })
  }

  const { data: academicPeriodsData } = useQuery({
    ...useAcademicPeriodsQueryOptions({ limit: 100 }),
  })
  const academicPeriods = academicPeriodsData?.data ?? []

  const { data: coursesData } = useQuery({
    queryKey: ['academic-period-courses', academicPeriodId],
    queryFn: async () => {
      const response = await tuyau.api.v1['academic-periods']({
        id: academicPeriodId!,
      }).courses.$get()
      if (response.error) throw new Error('Erro ao carregar cursos')
      return response.data as AcademicPeriodCourse[]
    },
    enabled: !!academicPeriodId,
  })
  const courses = coursesData ?? []

  const classes = useMemo(() => {
    if (!courseId || !courses.length) return []

    const selectedCourse = courses.find((course) => course.courseId === courseId)
    if (!selectedCourse) return []

    return selectedCourse.levels.flatMap((level) =>
      level.classes.map((classItem) => ({
        ...classItem,
        levelName: level.name,
      }))
    )
  }, [courseId, courses])

  const { data, isLoading, error, refetch } = useQuery(
    useContractsQueryOptions({
      page,
      limit,
      search: search || undefined,
      academicPeriodId: academicPeriodId || undefined,
      courseId: courseId || undefined,
      classId: classId || undefined,
      status: statusFilter,
    })
  )

  const [contractActionPendingId, setContractActionPendingId] = useState<string | null>(null)

  const updateContract = useMutation(updateContractMutationOptions())

  const handleEdit = (contract: ContractItem) => {
    router.visit(`/escola/administrativo/contratos/${contract.id}/editar`)
  }

  const handleToggleActive = async (contract: ContractItem) => {
    if (typeof contract.isActive !== 'boolean') return

    try {
      setContractActionPendingId(contract.id)
      await updateContract.mutateAsync({
        id: contract.id,
        isActive: !contract.isActive,
      })
      await queryClient.invalidateQueries({ queryKey: ['contracts'] })
      toast.success(
        contract.isActive ? 'Contrato desativado com sucesso' : 'Contrato reativado com sucesso'
      )
    } catch (error) {
      console.error('Error toggling contract status:', error)
      toast.error('Erro ao atualizar status do contrato')
    } finally {
      setContractActionPendingId(null)
    }
  }

  const contracts: ContractItem[] = (data?.data ?? []) as ContractItem[]
  const meta: ContractsMeta = (data?.meta ?? null) as ContractsMeta

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contratos..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Link route="web.escola.administrativo.contratos.novo">
          <Button className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Contrato
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />

            <Select
              value={academicPeriodId || 'all'}
              onValueChange={(value) =>
                setFilters({
                  academicPeriodId: value === 'all' ? null : value,
                  courseId: null,
                  classId: null,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Período Letivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                {academicPeriods.map((period: any) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={courseId || 'all'}
              onValueChange={(value) =>
                setFilters({
                  courseId: value === 'all' ? null : value,
                  classId: null,
                  page: 1,
                })
              }
              disabled={!academicPeriodId}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.courseId} value={course.courseId}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={classId || 'all'}
              onValueChange={(value) =>
                setFilters({
                  classId: value === 'all' ? null : value,
                  page: 1,
                })
              }
              disabled={!courseId}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name} ({classItem.levelName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setFilters({
                  status: value === 'active' ? null : value,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Somente ativos</SelectItem>
                <SelectItem value="inactive">Somente inativos</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading && <ContractsListSkeleton />}

      {error && <ContractsListErrorFallback error={error} resetErrorBoundary={() => refetch()} />}

      {!isLoading && !error && contracts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhum contrato encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">Cadastre o primeiro contrato</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && contracts.length > 0 && (
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Nome</th>
                  <th className="text-left p-4 font-medium">Matrícula</th>
                  <th className="text-left p-4 font-medium">Mensalidade</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr key={contract.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <span className="font-medium">{contract.name}</span>
                        {contract.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {contract.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{getEnrollmentLabel(contract)}</td>
                    <td className="p-4 text-muted-foreground">{getTuitionLabel(contract)}</td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={
                          contract.isActive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-100 text-slate-700'
                        }
                      >
                        {contract.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(contract)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(contract)}
                            disabled={contractActionPendingId === contract.id}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {contract.isActive ? 'Desativar' : 'Reativar'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {contracts.length} de {meta.total} contratos
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setFilters({ page: page - 1 })}
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
                  onClick={() => setFilters({ page: page + 1 })}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
