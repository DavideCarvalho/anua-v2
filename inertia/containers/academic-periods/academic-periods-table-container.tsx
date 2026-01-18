import { useSuspenseQuery } from '@tanstack/react-query'

import { useAcademicPeriodsQueryOptions } from '../../hooks/queries/use-academic-periods'
import { Card, CardContent } from '../../components/ui/card'

export function AcademicPeriodsTableContainer({ schoolId }: { schoolId: string }) {
  const { data } = useSuspenseQuery(
    useAcademicPeriodsQueryOptions({ schoolId, page: 1, limit: 20 })
  )

  const rows = Array.isArray(data) ? data : data?.data || []

  return (
    <Card>
      <CardContent className="py-4">
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium">Início</th>
                <th className="text-left p-3 font-medium">Término</th>
                <th className="text-left p-3 font-medium">Ativo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3 font-medium">{row.name}</td>
                  <td className="p-3 text-muted-foreground">
                    {String(row.startDate).slice(0, 10)}
                  </td>
                  <td className="p-3 text-muted-foreground">{String(row.endDate).slice(0, 10)}</td>
                  <td className="p-3 text-muted-foreground">{row.isActive ? 'Sim' : 'Não'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
