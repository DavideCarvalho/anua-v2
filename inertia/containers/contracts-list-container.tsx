import { useState } from 'react'
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
import { useContractsQueryOptions } from '../hooks/queries/use_contracts'
import { deleteContractMutationOptions } from '../hooks/mutations/use_contract_mutations'
import { toast } from 'sonner'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  Trash2,
} from 'lucide-react'

interface ContractItem {
  id: string
  name: string
  description?: string
  enrollmentValue?: number
  ammount?: number
  installments?: number
  flexibleInstallments?: boolean
  isActive?: boolean
}

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
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  })

  const { search, page, limit } = filters

  const { data, isLoading, error, refetch } = useQuery(
    useContractsQueryOptions({ page, limit, search: search || undefined })
  )

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [contractToDelete, setContractToDelete] = useState<ContractItem | null>(null)

  const deleteContract = useMutation(deleteContractMutationOptions())

  const handleEdit = (contract: ContractItem) => {
    router.visit(`/escola/administrativo/contratos/${contract.id}/editar`)
  }

  const handleDelete = (contract: ContractItem) => {
    setContractToDelete(contract)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!contractToDelete) return
    try {
      await deleteContract.mutateAsync(contractToDelete.id)
      await queryClient.invalidateQueries({ queryKey: ['contracts'] })
      toast.success('Contrato removido com sucesso')
    } catch (error) {
      console.error('Error deleting contract:', error)
      toast.error('Erro ao remover contrato')
    } finally {
      setIsDeleteModalOpen(false)
      setContractToDelete(null)
    }
  }

  const contracts = data?.data ?? []
  const meta = data?.meta ?? null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contratos..."
            className="pl-9"
            value={search || ''}
            onChange={(e) => setFilters({ search: e.target.value || null, page: 1 })}
          />
        </div>
        <Link route="web.escola.administrativo.contratos.novo">
          <Button className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Contrato
          </Button>
        </Link>
      </div>

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
                  <th className="text-left p-4 font-medium">Parcelas</th>
                  <th className="text-right p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract: any) => (
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
                    <td className="p-4 text-muted-foreground">
                      {formatCurrency(contract.enrollmentValue)}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {formatCurrency(contract.ammount)}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {contract.flexibleInstallments ? (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Flexível
                        </span>
                      ) : (
                        `${contract.installments}x`
                      )}
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(contract)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
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

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir contrato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o contrato "{contractToDelete?.name}"? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteContract.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
