import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Users, GraduationCap } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

const SEGMENT_LABELS: Record<string, string> = {
  KINDERGARTEN: 'Educação Infantil',
  ELEMENTARY: 'Ensino Fundamental',
  HIGHSCHOOL: 'Ensino Médio',
  TECHNICAL: 'Ensino Técnico',
  UNIVERSITY: 'Ensino Superior',
  OTHER: 'Outro',
}

interface PeriodoLetivoInfoCardProps {
  startDate: string
  endDate: string
  enrollmentStartDate: string | null
  enrollmentEndDate: string | null
  segment: string
}

export function PeriodoLetivoInfoCard({
  startDate,
  endDate,
  enrollmentStartDate,
  enrollmentEndDate,
  segment,
}: PeriodoLetivoInfoCardProps) {
  const formatDate = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Período</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-muted-foreground">Início:</span>{' '}
              {formatDate(startDate)}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Término:</span>{' '}
              {formatDate(endDate)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Matrículas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {enrollmentStartDate && enrollmentEndDate ? (
            <div className="space-y-1">
              <p className="text-sm">
                <span className="text-muted-foreground">Início:</span>{' '}
                {formatDate(enrollmentStartDate)}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Término:</span>{' '}
                {formatDate(enrollmentEndDate)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Não definido</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Segmento</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">
            {SEGMENT_LABELS[segment] ?? segment}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
