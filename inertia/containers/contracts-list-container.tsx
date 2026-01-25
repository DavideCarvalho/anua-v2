import { Suspense, useState } from 'react'
import { useSuspenseQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { usePage } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { useContractsQueryOptions } from '../hooks/queries/use_contracts'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Switch } from '../components/ui/switch'
import {
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  Pencil,
} from 'lucide-react'
import type { SharedProps } from '../lib/types'

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

function formatCurrency(valueInCents: number | null | undefined): string {
  if (valueInCents == null) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueInCents / 100)
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
              <th className="text-left p-4 font-medium">Nome</th>
              <th className="text-left p-4 font-medium">Matrícula</th>
              <th className="text-left p-4 font-medium">Mensalidade</th>
              <th className="text-left p-4 font-medium">Parcelas</th>
              <th className="text-left p-4 font-medium">Ativo</th>
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
                <td className="p-4">
                  <Switch checked={contract.isActive} disabled />
                </td>
                <td className="p-4 text-right">
                  <Link
                    route="web.escola.administrativo.contratos.editar"
                    params={{ id: contract.id }}
                  >
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
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
        <Link route="web.escola.administrativo.contratos.novo">
          <Button className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Contrato
          </Button>
        </Link>
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
