import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Calendar, Check, X, User } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

import { api } from '~/lib/api'

import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import type { Route } from '@tuyau/core/types'

interface TeacherAbsencesTableProps {
  status?: string
}

interface AbsenceItem {
  id: string
  status: string
  date?: Date | string | null
  reason?: string | null
  teacher?: {
    user?: {
      name?: string | null
    } | null
    name?: string | null
  } | null
}

type TeacherAbsencesResponseData = Route.Response<'api.v1.teachers.list_teachers'>['data']

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  PENDING: { label: 'Pendente', variant: 'secondary' },
  APPROVED: { label: 'Aprovado', variant: 'default' },
  REJECTED: { label: 'Rejeitado', variant: 'destructive' },
}

export function TeacherAbsencesTable({ status }: TeacherAbsencesTableProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const {
    data: teachersResponse,
    isLoading: isTeachersLoading,
    isError: isTeachersError,
  } = useQuery(api.api.v1.teachers.listTeachers.queryOptions({ query: { page: 1, limit: 100 } }))

  const teachers = (teachersResponse?.data ?? []) as TeacherAbsencesResponseData

  useEffect(() => {
    if (!selectedTeacherId && teachers.length > 0) {
      setSelectedTeacherId(teachers[0].id)
    }
  }, [selectedTeacherId, teachers])

  const absencesQuery = useQuery({
    ...api.api.v1.teachers.getTeacherAbsences.queryOptions({
      query: { teacherId: selectedTeacherId, month, year },
    }),
    enabled: !!selectedTeacherId,
  })

  const approveMutation = useMutation(api.api.v1.teachers.approveAbsence.mutationOptions())
  const rejectMutation = useMutation(api.api.v1.teachers.rejectAbsence.mutationOptions())

  const isAbsencesLoading = absencesQuery.isLoading
  const hasError = isTeachersError || absencesQuery.isError

  const absences = useMemo(() => {
    const data = (absencesQuery.data ?? []) as AbsenceItem[]
    if (!status) return data
    return data.filter((absence) => absence.status === status)
  }, [absencesQuery.data, status])

  async function handleApprove(absenceId: string) {
    try {
      await approveMutation.mutateAsync({ body: { absenceId } })
      await absencesQuery.refetch()
      toast.success('Falta aprovada com sucesso')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao aprovar falta')
    }
  }

  async function handleReject(absenceId: string) {
    try {
      await rejectMutation.mutateAsync({
        body: { absenceId, rejectionReason: '' },
      })
      await absencesQuery.refetch()
      toast.success('Falta rejeitada com sucesso')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao rejeitar falta')
    }
  }

  if (isTeachersLoading || isAbsencesLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Carregando ausencias...</p>
        </CardContent>
      </Card>
    )
  }

  if (hasError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Erro ao carregar ausencias</h3>
          <p className="mt-2 text-sm text-muted-foreground">Tente novamente em alguns instantes.</p>
        </CardContent>
      </Card>
    )
  }

  if (teachers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum professor encontrado</h3>
        </CardContent>
      </Card>
    )
  }

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
        <div className="pt-2">
          <Select
            value={selectedTeacherId}
            onValueChange={(v, _event) => v !== null && setSelectedTeacherId(v)}
          >
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Selecione um professor" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.user?.name || 'Professor sem nome'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            {absences.map((absence) => {
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
                  <TableCell className="max-w-[200px] truncate">{absence.reason || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {absence.status === 'PENDING' && (
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApprove(absence.id)}
                          disabled={approveMutation.isPending}
                          title="Aprovar"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReject(absence.id)}
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
