import { useSuspenseQuery } from '@tanstack/react-query'
import { TrendingUp, AlertTriangle, ShieldOff } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { Skeleton } from '../../components/ui/skeleton'
import { useInsuranceDefaultRateQueryOptions } from '../../hooks/queries/use_insurance_default_rate'

export function DefaultRateBySchool() {
  const { data } = useSuspenseQuery(useInsuranceDefaultRateQueryOptions(10))

  if (!data) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Taxa de Inadimplência por Escola
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            Plataforma: {data.platformDefaultRate}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {data.schools.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Sem dados de inadimplência disponíveis.
          </div>
        ) : (
          <div className="space-y-4">
            {data.schools.map((school: any) => (
              <div key={school.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{school.name}</span>
                    {school.hasInsurance ? (
                      <Badge variant="outline" className="text-xs border-green-200 bg-green-50 text-green-700">
                        Segurada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs border-gray-200 bg-gray-50 text-gray-700">
                        <ShieldOff className="h-3 w-3 mr-1" />
                        Sem seguro
                      </Badge>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      school.defaultRate > 20
                        ? 'text-red-600'
                        : school.defaultRate > 10
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    }`}
                  >
                    {school.defaultRate}%
                  </span>
                </div>
                <Progress
                  value={Math.min(school.defaultRate, 100)}
                  className={`h-2 ${
                    school.defaultRate > 20
                      ? '[&>div]:bg-red-500'
                      : school.defaultRate > 10
                        ? '[&>div]:bg-yellow-500'
                        : '[&>div]:bg-green-500'
                  }`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{school.overduePayments} em atraso</span>
                  <span>{school.totalPayments} total</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function DefaultRateBySchoolSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
