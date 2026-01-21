import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { useSubjectsQueryOptions } from '../../hooks/queries/use-subjects'

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

export function SubjectsTableContainer({
  schoolId,
  onEdit,
}: {
  schoolId: string
  onEdit: (id: string) => void
}) {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery(useSubjectsQueryOptions({ page, limit: 10, schoolId }))

  if (isLoading) {
    return <SubjectsTableSkeleton />
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
                <th className="text-left p-3 font-medium">Código</th>
                <th className="text-right p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3 font-medium">{row.name}</td>
                  <td className="p-3 text-muted-foreground">{row.slug}</td>
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
                onClick={() => setPage(meta.currentPage - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.currentPage >= meta.lastPage}
                onClick={() => setPage(meta.currentPage + 1)}
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
