import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import { useScholarshipsQueryOptions } from '../hooks/queries/use_scholarships'
import { useToggleScholarshipActiveMutation } from '../hooks/mutations/use_toggle_scholarship_active'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Switch } from '../components/ui/switch'
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
  GraduationCap,
  Plus,
  MoreHorizontal,
  Edit,
} from 'lucide-react'

// Loading Skeleton
function ScholarshipsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="p-4 border-b last:border-0">
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, j) => (
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
function ScholarshipsListErrorFallback({
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
          <h3 className="font-semibold text-destructive">Erro ao carregar bolsas</h3>
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

const typeMap: Record<string, string> = {
  PHILANTHROPIC: 'Filantrópica',
  DISCOUNT: 'Desconto',
  COMPANY_PARTNERSHIP: 'Parceria Empresarial',
  FREE: 'Gratuita',
}

// Container Export
export function ScholarshipsTableContainer({
  onEdit,
  onNew,
}: {
  onEdit: (id: string) => void
  onNew: () => void
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <ScholarshipsListErrorFallback error={error as Error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <ScholarshipsTableContent onEdit={onEdit} onNew={onNew} />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

function ScholarshipsTableContent({
  onEdit,
  onNew,
}: {
  onEdit: (id: string) => void
  onNew: () => void
}) {
  // URL state with nuqs
  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  })

  const { search, page, limit } = filters

  const { data, isLoading, error, refetch } = useQuery(
    useScholarshipsQueryOptions({ page, limit, search: search || undefined })
  )

  const toggleActive = useToggleScholarshipActiveMutation()

  const rows = data?.data ?? []
  const meta = data?.meta ?? null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar bolsas..."
            className="pl-9"
            value={search || ''}
            onChange={(e) => setFilters({ search: e.target.value || null, page: 1 })}
          />
        </div>
        <Button className="ml-auto" onClick={onNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Bolsa
        </Button>
      </div>

      {isLoading && <ScholarshipsListSkeleton />}

      {error && (
        <ScholarshipsListErrorFallback error={error} resetErrorBoundary={() => refetch()} />
      )}

      {!isLoading && !error && rows.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma bolsa encontrada</h3>
            <p className="text-sm text-muted-foreground mt-1">Cadastre a primeira bolsa</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && rows.length > 0 && (
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Nome</th>
                  <th className="text-left p-4 font-medium">Tipo</th>
                  <th className="text-left p-4 font-medium">Desc. Mensalidade</th>
                  <th className="text-left p-4 font-medium">Desc. Matrícula</th>
                  <th className="text-left p-4 font-medium">Código</th>
                  <th className="text-left p-4 font-medium">Parceiro</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any) => (
                  <tr key={row.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{row.name}</td>
                    <td className="p-4">
                      <Badge variant="outline">{typeMap[row.type] || row.type}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{row.discountPercentage}%</td>
                    <td className="p-4 text-muted-foreground">
                      {row.enrollmentDiscountPercentage ?? 0}%
                    </td>
                    <td className="p-4 text-muted-foreground font-mono text-sm">
                      {row.code || '-'}
                    </td>
                    <td className="p-4 text-muted-foreground">{row.schoolPartner?.name || '-'}</td>
                    <td className="p-4">
                      <Switch
                        checked={!!row.isActive}
                        onCheckedChange={() => {
                          toggleActive.mutate({ id: row.id })
                        }}
                      />
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(row.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
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
                Mostrando {rows.length} de {meta.total} bolsas
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
