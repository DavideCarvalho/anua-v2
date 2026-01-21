import { useSuspenseQuery } from '@tanstack/react-query'
import { ShieldOff, AlertTriangle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { Skeleton } from '../../components/ui/skeleton'
import { useSchoolsWithoutInsuranceQueryOptions } from '../../hooks/queries/use-schools-without-insurance'
import { brazilianRealFormatter } from '../../lib/formatters'

const RISK_COLORS: Record<string, string> = {
  LOW: 'border-green-200 bg-green-50 text-green-700',
  MEDIUM: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  HIGH: 'border-red-200 bg-red-50 text-red-700',
}

const RISK_LABELS: Record<string, string> = {
  LOW: 'Baixo',
  MEDIUM: 'Médio',
  HIGH: 'Alto',
}

export function SchoolsWithoutInsurance() {
  const { data } = useSuspenseQuery(useSchoolsWithoutInsuranceQueryOptions(15))

  if (!data) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldOff className="h-5 w-5 text-orange-600" />
          Escolas sem Seguro
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.data.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Todas as escolas possuem seguro ativo.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Escola</TableHead>
                <TableHead>Alunos</TableHead>
                <TableHead>Inadimplência</TableHead>
                <TableHead>Valor em Atraso</TableHead>
                <TableHead>Risco</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((school: any) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell>{school.totalStudents}</TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${
                        school.defaultRate > 20
                          ? 'text-red-600'
                          : school.defaultRate > 10
                            ? 'text-yellow-600'
                            : 'text-green-600'
                      }`}
                    >
                      {school.defaultRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-red-600">
                    {brazilianRealFormatter(school.overdueAmount / 100)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`gap-1 ${RISK_COLORS[school.riskLevel] || ''}`}
                    >
                      {school.riskLevel === 'HIGH' && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {RISK_LABELS[school.riskLevel] || school.riskLevel}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export function SchoolsWithoutInsuranceSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
