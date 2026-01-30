import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import { useSchoolPartnersQueryOptions } from '../hooks/queries/use_school_partners'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { Input } from '../components/ui/input'
import { Search, AlertCircle } from 'lucide-react'

function SchoolPartnersTableSkeleton() {
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

function SchoolPartnersErrorFallback({
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
          <h3 className="font-semibold text-destructive">Erro ao carregar parceiros</h3>
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

export function SchoolPartnersTableContainer({ onEdit }: { onEdit: (id: string) => void }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <SchoolPartnersErrorFallback error={error as Error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <SchoolPartnersTableContent onEdit={onEdit} />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

function SchoolPartnersTableContent({ onEdit }: { onEdit: (id: string) => void }) {
  // URL state with nuqs
  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  })

  const { search, page, limit } = filters

  const { data, isLoading } = useQuery(
    useSchoolPartnersQueryOptions({ page, limit, search: search || undefined })
  )

  if (isLoading) {
    return <SchoolPartnersTableSkeleton />
  }

  const result = data as any
  const rows = Array.isArray(result) ? result : result?.data || []
  const meta = !Array.isArray(result) && result?.meta ? result.meta : null

  return (
    <Card>
      <CardContent className="py-4">
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar parceiros..."
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
                <th className="text-left p-3 font-medium">CNPJ</th>
                <th className="text-left p-3 font-medium">Contato</th>
                <th className="text-left p-3 font-medium">Telefone</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Desconto</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3 font-medium">{row.name}</td>
                  <td className="p-3 text-muted-foreground">{row.cnpj}</td>
                  <td className="p-3 text-muted-foreground">{row.contactName || '-'}</td>
                  <td className="p-3 text-muted-foreground">{row.phone || '-'}</td>
                  <td className="p-3 text-muted-foreground">{row.email || '-'}</td>
                  <td className="p-3 text-muted-foreground">{row.discountPercentage}%</td>
                  <td className="p-3 text-muted-foreground">
                    {row.isActive ? 'Ativo' : 'Inativo'}
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onEdit(row.id)
                      }}
                    >
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
