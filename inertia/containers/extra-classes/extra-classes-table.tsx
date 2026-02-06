import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import {
  MoreHorizontal,
  Search,
  Users,
  Clock,
  UserPlus,
  ClipboardList,
  BarChart3,
  Pencil,
  Power,
} from 'lucide-react'

import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { useExtraClassesQueryOptions, type ExtraClass } from '~/hooks/queries/use_extra_classes'
import { useDeleteExtraClass } from '~/hooks/mutations/use_extra_class_mutations'
import { toast } from 'sonner'

const DAY_LABELS: Record<number, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sab',
}

interface ExtraClassesTableProps {
  schoolId: string
  academicPeriodId?: string
  onEdit: (id: string) => void
  onEnroll: (id: string) => void
  onAttendance: (id: string) => void
  onSummary: (id: string) => void
  onStudents: (id: string) => void
}

export function ExtraClassesTable({
  schoolId,
  academicPeriodId,
  onEdit,
  onEnroll,
  onAttendance,
  onSummary,
  onStudents,
}: ExtraClassesTableProps) {
  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  })

  const { search, page, limit } = filters

  const { data, isLoading } = useQuery(
    useExtraClassesQueryOptions({
      page,
      limit,
      schoolId,
      academicPeriodId,
      search: search || undefined,
    })
  )

  const deleteMutation = useDeleteExtraClass()

  const handleDeactivate = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Aula avulsa desativada'),
      onError: () => toast.error('Erro ao desativar'),
    })
  }

  if (isLoading) {
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

  const rows = data?.data ?? []
  const meta = data?.meta ?? null

  return (
    <Card>
      <CardContent className="py-4">
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aulas avulsas..."
              className="pl-9"
              value={search || ''}
              onChange={(e) => setFilters({ search: e.target.value || null, page: 1 })}
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma aula avulsa</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Crie uma aula avulsa para comecar.
            </p>
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Professor</TableHead>
                    <TableHead>Horarios</TableHead>
                    <TableHead className="text-center">Vagas</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((ec: ExtraClass) => (
                    <TableRow key={ec.id}>
                      <TableCell className="font-medium">
                        <div>
                          {ec.name}
                          {ec.academicPeriod && (
                            <p className="text-xs text-muted-foreground">{ec.academicPeriod.name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {ec.teacher?.user?.name ?? '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {ec.schedules.map((s) => (
                            <Badge key={s.id} variant="outline" className="text-xs">
                              {DAY_LABELS[s.weekDay]} {s.startTime}-{s.endTime}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {ec.maxStudents ? (
                          <span className={ec.enrollmentCount >= ec.maxStudents ? 'text-destructive font-medium' : ''}>
                            {ec.enrollmentCount}/{ec.maxStudents}
                          </span>
                        ) : (
                          <span>{ec.enrollmentCount}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={ec.isActive ? 'default' : 'secondary'}>
                          {ec.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(ec.id)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onStudents(ec.id)}>
                              <Users className="mr-2 h-4 w-4" />
                              Alunos Inscritos
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEnroll(ec.id)}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Inscrever Aluno
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAttendance(ec.id)}>
                              <ClipboardList className="mr-2 h-4 w-4" />
                              Lancar Frequencia
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSummary(ec.id)}>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Resumo Frequencia
                            </DropdownMenuItem>
                            {ec.isActive && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeactivate(ec.id)}
                              >
                                <Power className="mr-2 h-4 w-4" />
                                Desativar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {meta && meta.lastPage > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Pagina {meta.currentPage} de {meta.lastPage}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.currentPage <= 1}
                    onClick={() => setFilters({ page: meta.currentPage - 1 })}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.currentPage >= meta.lastPage}
                    onClick={() => setFilters({ page: meta.currentPage + 1 })}
                  >
                    Proxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
