import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'

import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { Input } from '../../components/ui/input'
import { Search, AlertCircle } from 'lucide-react'
import { useSubjectsQueryOptions } from '../../hooks/queries/use_subjects'

function SubjectsTableSkeleton() {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SubjectsErrorFallback({
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
          <h3 className="font-semibold text-destructive">Erro ao carregar matérias</h3>
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

export function SubjectsTableContainer({
  schoolId,
  onEdit,
}: {
  schoolId: string
  onEdit: (id: string) => void
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <SubjectsErrorFallback error={error as Error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <SubjectsTableContent schoolId={schoolId} onEdit={onEdit} />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

function SubjectsTableContent({
  schoolId,
  onEdit,
}: {
  schoolId: string
  onEdit: (id: string) => void
}) {
  // URL state with nuqs
  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  })

  const { search, page, limit } = filters

  const { data, isLoading } = useQuery(
    useSubjectsQueryOptions({ page, limit, schoolId, search: search || undefined })
  )

  if (isLoading) {
    return <SubjectsTableSkeleton />
  }

  const rows = data?.data ?? []
  const meta = data?.meta ?? null

  return (
    <Card>
      <CardContent className="py-4">
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar matérias..."
              className="pl-9"
              value={search || ''}
              onChange={(e) => setFilters({ search: e.target.value || null, page: 1 })}
            />
          </div>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-right p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: { id: string; name: string }) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3 font-medium">{row.name}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" onClick={() => onEdit(row.id)}>
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Página {meta.currentPage} de {meta.lastPage}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.currentPage <= 1}
                onClick={() => setFilters({ page: meta.currentPage - 1 })}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.currentPage >= meta.lastPage}
                onClick={() => setFilters({ page: meta.currentPage + 1 })}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
