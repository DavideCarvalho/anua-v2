import { Suspense, useState } from 'react'
import { useSuspenseQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useContractsQueryOptions } from '../hooks/queries/use-contracts'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  MoreHorizontal,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'

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
function ContractsListError({
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

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  active: { label: 'Ativo', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700', icon: XCircle },
  expired: { label: 'Expirado', className: 'bg-gray-100 text-gray-700', icon: XCircle },
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

// Content Component
function ContractsListContent({
  page,
  onPageChange,
}: {
  page: number
  onPageChange: (page: number) => void
}) {
  const { data } = useSuspenseQuery(useContractsQueryOptions({ page, limit: 20 }))

  const contracts = Array.isArray(data) ? data : data?.data || []
  const meta = !Array.isArray(data) && data?.meta ? data.meta : null

  if (contracts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Nenhum contrato encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1">Cadastre o primeiro contrato</p>
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
              <th className="text-left p-4 font-medium">Contrato</th>
              <th className="text-left p-4 font-medium">Aluno</th>
              <th className="text-left p-4 font-medium">Início</th>
              <th className="text-left p-4 font-medium">Término</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-right p-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract: any) => {
              const status = statusConfig[contract.status] || statusConfig.pending
              const StatusIcon = status.icon

              return (
                <tr key={contract.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <span className="font-mono text-sm">#{contract.id.slice(0, 8)}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                        {contract.student?.user?.name?.charAt(0) ||
                          contract.student?.name?.charAt(0) ||
                          'A'}
                      </div>
                      <span className="font-medium">
                        {contract.student?.user?.name || contract.student?.name || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{formatDate(contract.startDate)}</td>
                  <td className="p-4 text-muted-foreground">{formatDate(contract.endDate)}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.className}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
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
export function ContractsListContainer() {
  const [page, setPage] = useState(1)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar contratos..." className="pl-9" />
        </div>
        <Button className="ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ error, resetErrorBoundary }) => (
              <ContractsListError error={error} resetErrorBoundary={resetErrorBoundary} />
            )}
          >
            <Suspense fallback={<ContractsListSkeleton />}>
              <ContractsListContent page={page} onPageChange={setPage} />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </div>
  )
}
