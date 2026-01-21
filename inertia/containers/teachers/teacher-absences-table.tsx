import { useSuspenseQuery } from '@tanstack/react-query'
import { Calendar, Check, X, Clock, User } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { useTeacherAbsencesQueryOptions } from '../../hooks/queries/use-teacher-absences'
import { useApproveTeacherAbsence, useRejectTeacherAbsence } from '../../hooks/mutations/use-teacher-mutations'

import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

interface TeacherAbsencesTableProps {
  status?: string
}

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  PENDING: { label: 'Pendente', variant: 'secondary' },
  APPROVED: { label: 'Aprovado', variant: 'default' },
  REJECTED: { label: 'Rejeitado', variant: 'destructive' },
}

export function TeacherAbsencesTable({ status }: TeacherAbsencesTableProps) {
  const { data } = useSuspenseQuery(useTeacherAbsencesQueryOptions({ status }))
  const approveMutation = useApproveTeacherAbsence()
  const rejectMutation = useRejectTeacherAbsence()

  const absences = Array.isArray(data) ? data : data?.data || []

  if (absences.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma ausência registrada</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            As solicitações de ausência dos professores aparecerão aqui
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ausências de Professores</CardTitle>
        <CardDescription>{absences.length} registro(s)</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Professor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {absences.map((absence: any) => {
              const config = statusConfig[absence.status] || statusConfig.PENDING

              return (
                <TableRow key={absence.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {absence.teacher?.user?.name || absence.teacher?.name || '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {absence.date
                      ? format(new Date(absence.date), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {absence.reason || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {absence.status === 'PENDING' && (
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => approveMutation.mutate(absence.id)}
                          disabled={approveMutation.isPending}
                          title="Aprovar"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => rejectMutation.mutate({ absenceId: absence.id })}
                          disabled={rejectMutation.isPending}
                          title="Rejeitar"
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
