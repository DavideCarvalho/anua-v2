import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@inertiajs/react'
import { format, differenceInDays, isBefore } from 'date-fns'
import {
  AlertCircle,
  CalendarPlus,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'

import { useAcademicPeriodsQueryOptions } from '../../hooks/queries/use-academic-periods'
import { Card, CardContent } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog'

interface AcademicPeriod {
  id: string
  name: string
  slug: string
  startDate: string
  endDate: string
  enrollmentStartDate: string | null
  enrollmentEndDate: string | null
  isActive: boolean
  segment: string
}

export function AcademicPeriodsTableContainer({ schoolId }: { schoolId: string }) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(
    useAcademicPeriodsQueryOptions({ schoolId, page: 1, limit: 20 })
  )

  const rows: AcademicPeriod[] = useMemo(() => {
    if (Array.isArray(data)) return data
    return data?.data ?? []
  }, [data])

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/academic-periods/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Erro ao excluir período letivo')
      return response.json()
    },
    onSuccess: () => {
      toast.success('Período letivo excluído com sucesso')
      queryClient.invalidateQueries({ queryKey: ['academic-periods'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Período Letivo</th>
                <th className="text-left p-3 font-medium">Período</th>
                <th className="text-left p-3 font-medium">Matrículas</th>
                <th className="text-left p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Nenhum período letivo encontrado
                  </td>
                </tr>
              )}
              {rows.map((row) => {
                const now = new Date()
                const start = new Date(row.startDate)
                const end = new Date(row.endDate)
                const daysUntilEnd = differenceInDays(end, now)
                const isUrgent = daysUntilEnd <= 7 && daysUntilEnd > 0
                const isActive = now >= start && now <= end
                const isBeforeStart = isBefore(now, start)

                const enrollmentStart = row.enrollmentStartDate ? new Date(row.enrollmentStartDate) : null
                const enrollmentEnd = row.enrollmentEndDate ? new Date(row.enrollmentEndDate) : null
                const isEnrollmentOpen = enrollmentStart && enrollmentEnd
                  ? now >= enrollmentStart && now <= enrollmentEnd
                  : false
                const isBeforeEnrollment = enrollmentStart && now < enrollmentStart

                return (
                  <tr key={row.id} className="border-t">
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{row.name}</span>
                          {isUrgent && (
                            <Badge variant="destructive" className="h-5">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              {daysUntilEnd}d
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {format(start, 'dd/MM/yyyy')} - {format(end, 'dd/MM/yyyy')}
                          </span>
                          <Badge variant={isActive ? 'default' : 'secondary'}>
                            {isActive ? 'Em andamento' : isBeforeStart ? 'Não iniciado' : 'Finalizado'}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {isActive
                            ? `${daysUntilEnd} dias restantes`
                            : isBeforeStart
                              ? `Inicia em ${differenceInDays(start, now)} dias`
                              : `Finalizado há ${Math.abs(daysUntilEnd)} dias`}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          {enrollmentStart && enrollmentEnd ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {isEnrollmentOpen ? 'Aberto' : isBeforeEnrollment ? 'Em breve' : 'Fechado'}
                                </span>
                                <Badge variant={isEnrollmentOpen ? 'default' : isBeforeEnrollment ? 'secondary' : 'destructive'}>
                                  {isEnrollmentOpen
                                    ? `${differenceInDays(enrollmentEnd, now)}d restantes`
                                    : isBeforeEnrollment
                                      ? `Inicia em ${differenceInDays(enrollmentStart, now)}d`
                                      : 'Encerrado'}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {format(enrollmentStart, 'dd/MM')} - {format(enrollmentEnd, 'dd/MM')}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">Não definido</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm leading-none font-medium">{row.name}</p>
                              <p className="text-muted-foreground text-xs leading-none">
                                {format(start, 'dd/MM/yyyy')} - {format(end, 'dd/MM/yyyy')}
                              </p>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem asChild>
                            <Link
                              href={`/escola/administrativo/periodos-letivos/novo-periodo-letivo?previousPeriodId=${row.id}`}
                              className="flex items-center gap-2"
                            >
                              <CalendarPlus className="h-4 w-4" />
                              <span>Criar próximo período</span>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem asChild>
                            <Link
                              href={`/escola/administrativo/periodos-letivos/${row.id}/editar`}
                              className="flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Editar período</span>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link
                              href={`/escola/periodos-letivos/${row.slug}`}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Ver detalhes</span>
                            </Link>
                          </DropdownMenuItem>

                          {isBeforeStart ? (
                            <>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Excluir período</span>
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir período letivo</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir este período letivo? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMutation.mutate(row.id)}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          ) : (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-muted-foreground cursor-not-allowed" disabled>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Excluir período</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
