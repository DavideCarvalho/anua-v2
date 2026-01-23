import { Head } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { EscolaLayout } from '~/components/layouts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
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
} from '~/components/ui/alert-dialog'
import { Calendar, Plus, Settings, Loader2, MoreVertical, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatSegmentName } from '~/lib/formatters'
import { useAcademicPeriodsQueryOptions } from '~/hooks/queries/use-academic-periods'
import { useDeleteAcademicPeriodMutationOptions } from '~/hooks/mutations/use-academic-period-mutations'

function formatDate(dateString: string): string {
  return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
}

export default function PeriodosLetivosPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery(useAcademicPeriodsQueryOptions({ limit: 50 }))

  const deleteMutation = useMutation(useDeleteAcademicPeriodMutationOptions())

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Período letivo excluído com sucesso')
      queryClient.invalidateQueries({ queryKey: ['academic-periods'] })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir período letivo')
    }
  }

  const periods = data?.data ?? []

  return (
    <EscolaLayout>
      <Head title="Períodos Letivos" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Períodos Letivos</h1>
            <p className="text-muted-foreground">Gerencie os anos e semestres letivos</p>
          </div>
          <Link route="web.escola.administrativo.novoPeriodoLetivo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Período
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">
                Erro ao carregar períodos letivos. Tente novamente.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && periods.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum período letivo cadastrado.</p>
                <Link route="web.escola.administrativo.novoPeriodoLetivo">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Período
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && periods.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {periods.map((period) => (
              <Card key={period.id} className={period.isActive ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Calendar
                      className={`h-6 w-6 ${period.isActive ? 'text-primary' : 'text-muted-foreground'}`}
                    />
                    <div className="flex items-center gap-2">
                      {period.isActive && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Atual
                        </span>
                      )}
                      {period.isClosed && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          Encerrado
                        </span>
                      )}
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir período letivo</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir "{period.name}"? O período será desativado e não aparecerá mais na listagem.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(period.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardTitle className={!period.isActive ? 'text-muted-foreground' : ''}>
                    {period.name}
                  </CardTitle>
                  <CardDescription>{formatSegmentName(period.segment)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Início</span>
                      <span>{formatDate(period.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Término</span>
                      <span>{formatDate(period.endDate)}</span>
                    </div>
                    {period.enrollmentStartDate && period.enrollmentEndDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Matrículas</span>
                        <span>
                          {formatDate(period.enrollmentStartDate)} -{' '}
                          {formatDate(period.enrollmentEndDate)}
                        </span>
                      </div>
                    )}
                  </div>
                  <Link route="web.escola.periodosLetivos.show" params={{ slug: period.slug }}>
                    <Button
                      variant={period.isActive ? 'outline' : 'ghost'}
                      className="w-full mt-4"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {period.isActive ? 'Configurar' : 'Ver Detalhes'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </EscolaLayout>
  )
}
