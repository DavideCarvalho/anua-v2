import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSchoolPartnersQueryOptions } from '../hooks/queries/use_school_partners'
import { useSearchParams } from '../hooks/use_search_params'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'

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

export function SchoolPartnersTableContainer({ onEdit }: { onEdit: (id: string) => void }) {
  const { params, setParam } = useSearchParams()

  const page = params.page ? Number(params.page) : 1
  const limit = params.limit ? Number(params.limit) : 10

  useEffect(() => {
    if (!params.page) setParam('page', '1')
    if (!params.limit) setParam('limit', '10')
  }, [params.page, params.limit, setParam])

  const { data, isLoading } = useQuery(useSchoolPartnersQueryOptions({ page, limit }))

  if (isLoading) {
    return <SchoolPartnersTableSkeleton />
  }

  const rows = Array.isArray(data) ? data : data?.data || []
  const meta = !Array.isArray(data) && data?.meta ? data.meta : null

  return (
    <Card>
      <CardContent className="py-4">
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
                onClick={() => setParam('page', String(meta.currentPage - 1))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.currentPage >= meta.lastPage}
                onClick={() => setParam('page', String(meta.currentPage + 1))}
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
