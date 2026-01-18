import { useEffect } from 'react'
import { useSearchParams } from '../hooks/use-search-params'
import { Badge } from '../components/ui/badge'
import { Switch } from '../components/ui/switch'
import { useToggleScholarshipActiveMutation } from '../hooks/mutations/use-toggle-scholarship-active'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useScholarshipsQueryOptions } from '../hooks/queries/use-scholarships'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'

export function ScholarshipsTableContainer({ onEdit }: { onEdit: (id: string) => void }) {
  const { params, setParam } = useSearchParams()

  const page = params.page ? Number(params.page) : 1
  const limit = params.limit ? Number(params.limit) : 10

  useEffect(() => {
    if (!params.page) setParam('page', '1')
    if (!params.limit) setParam('limit', '10')
  }, [params.page, params.limit, setParam])

  const { data } = useSuspenseQuery(useScholarshipsQueryOptions({ page, limit }))
  const toggleActive = useToggleScholarshipActiveMutation()

  const rows = Array.isArray(data) ? data : data?.data || []
  const meta = !Array.isArray(data) && data?.meta ? data.meta : null

  const typeMap: Record<string, string> = {
    PHILANTHROPIC: 'Filantrópica',
    DISCOUNT: 'Desconto',
    COMPANY_PARTNERSHIP: 'Parceria Empresarial',
    FREE: 'Gratuita',
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium">Tipo</th>
                <th className="text-left p-3 font-medium">Desconto</th>
                <th className="text-left p-3 font-medium">Parceiro</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3 font-medium">{row.name}</td>
                  <td className="p-3">
                    <Badge variant="outline">{typeMap[row.type] || row.type}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{row.discountPercentage}%</td>
                  <td className="p-3 text-muted-foreground">{row.schoolPartner?.name || '-'}</td>
                  <td className="p-3">
                    <Switch
                      checked={!!row.isActive}
                      onCheckedChange={() => {
                        toggleActive.mutate({ id: row.id })
                      }}
                    />
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
