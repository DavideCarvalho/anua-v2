import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Users, TrendingDown, AlertTriangle, DollarSign, School } from 'lucide-react'

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function SchoolStatsCard({ totalStudents, overdueAmountCents }: any) {
  return (
    <div className="grid grid-cols-2 gap-3 py-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users className="h-4 w-4" />
            Total de Alunos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalStudents ?? 0}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <DollarSign className="h-4 w-4 text-red-500" />
            Inadimplência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-500">{formatBRL(overdueAmountCents ?? 0)}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function StudentAlertsCard({ alerts }: any) {
  if (!alerts?.length) return null
  return (
    <div className="space-y-2 py-2">
      {alerts.slice(0, 5).map((alert: any, i: number) => (
        <Card key={i} className={alert.priority === 'high' ? 'border-red-200' : ''}>
          <CardContent className="flex items-start gap-3 p-3">
            <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${alert.priority === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />
            <div className="text-sm min-w-0">
              <p className="font-medium truncate">{alert.student}</p>
              <p className="text-muted-foreground">{alert.description}</p>
            </div>
            <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'} className="shrink-0 ml-auto">
              {alert.priority === 'high' ? 'Urgente' : 'Atenção'}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function QueryResultCard({ rows, rowCount }: any) {
  if (!rows?.length) return <p className="text-sm text-muted-foreground py-2">Nenhum resultado encontrado.</p>
  const cols = Object.keys(rows[0])
  return (
    <div className="overflow-x-auto rounded-lg border py-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {cols.map((col: string) => (
              <th key={col} className="px-3 py-2 text-left font-medium text-muted-foreground">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any, i: number) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map((col: string) => (
                <td key={col} className="px-3 py-2">{String(row[col] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-3 py-1 text-xs text-muted-foreground">{rowCount} resultado(s)</p>
    </div>
  )
}

export function DataTable({ columns, rows }: any) {
  if (!rows?.length) return <p className="text-sm text-muted-foreground py-2">Nenhum dado.</p>
  const cols = columns || (rows[0] ? Object.keys(rows[0]) : [])
  return (
    <div className="overflow-x-auto rounded-lg border py-2 my-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {cols.map((col: string, i: number) => (
              <th key={i} className="px-3 py-2 text-left font-medium text-muted-foreground">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any, i: number) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map((col: string, j: number) => (
                <td key={j} className="px-3 py-2">{String(row[col] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function InfoCard({ title, description, value }: any) {
  return (
    <Card className="my-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

export const componentRegistry: Record<string, React.ComponentType<any>> = {
  SchoolStatsCard,
  StudentAlertsCard,
  DataTable,
  InfoCard,
}
