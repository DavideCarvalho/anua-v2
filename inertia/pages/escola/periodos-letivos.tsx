import { Head, Link } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { EscolaLayout } from '~/components/layouts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Calendar, Plus, Settings, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
  isClosed: boolean
}

interface AcademicPeriodsResponse {
  data: AcademicPeriod[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

async function fetchAcademicPeriods(): Promise<AcademicPeriodsResponse> {
  const response = await fetch('/api/v1/academic-periods?limit=50')
  if (!response.ok) throw new Error('Falha ao carregar períodos letivos')
  return response.json()
}

function formatDate(dateString: string): string {
  return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
}

export default function PeriodosLetivosPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['academicPeriods'],
    queryFn: fetchAcademicPeriods,
  })

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
          <Link href="/escola/administrativo/periodos-letivos/novo-periodo-letivo">
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
                <Link href="/escola/administrativo/periodos-letivos/novo-periodo-letivo">
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
                    <div className="flex gap-2">
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
                    </div>
                  </div>
                  <CardTitle className={!period.isActive ? 'text-muted-foreground' : ''}>
                    {period.name}
                  </CardTitle>
                  <CardDescription>{period.segment}</CardDescription>
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
                  <Link href={`/escola/administrativo/periodos-letivos/${period.id}`}>
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
