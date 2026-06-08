import { useMemo, useState } from 'react'
import { Head } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { Activity, AlertTriangle, CheckCircle2, Clock, Search, XCircle } from 'lucide-react'

import { AdminLayout } from '../../../components/layouts'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Skeleton } from '../../../components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import { api } from '~/lib/api'
import { cn } from '~/lib/utils'

type HealthStatus = 'healthy' | 'warning' | 'critical' | 'inactive'

const HEALTH_CONFIG: Record<
  HealthStatus,
  { label: string; icon: typeof CheckCircle2; class: string }
> = {
  healthy: { label: 'Saudável', icon: CheckCircle2, class: 'text-green-600 bg-green-600/10' },
  warning: { label: 'Atenção', icon: Clock, class: 'text-amber-600 bg-amber-600/10' },
  critical: { label: 'Crítico', icon: AlertTriangle, class: 'text-destructive bg-destructive/10' },
  inactive: { label: 'Inativo', icon: XCircle, class: 'text-muted-foreground bg-muted' },
}

const SUBSCRIPTION_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  TRIAL: 'Trial',
  BLOCKED: 'Bloqueado',
  CANCELLED: 'Cancelado',
  NONE: 'Sem plano',
}

function formatDaysAgo(days: number | null): string {
  if (days === null) return 'Nunca'
  if (days === 0) return 'Hoje'
  if (days === 1) return 'Ontem'
  if (days < 30) return `${days}d atrás`
  if (days < 365) return `${Math.floor(days / 30)}m atrás`
  return `${Math.floor(days / 365)}a atrás`
}

export default function SchoolHealthPage() {
  const { data, isLoading } = useQuery(api.api.v1.admin.schoolHealth.queryOptions())

  const [search, setSearch] = useState('')
  const [healthFilter, setHealthFilter] = useState<HealthStatus | 'all'>('all')
  const [subFilter, setSubFilter] = useState('all')

  type School = NonNullable<typeof data>['schools'][number]

  const filtered = useMemo(() => {
    if (!data) return [] as School[]
    return data.schools.filter((s: School) => {
      if (healthFilter !== 'all' && s.healthStatus !== healthFilter) return false
      if (subFilter !== 'all' && s.subscriptionStatus !== subFilter) return false
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [data, search, healthFilter, subFilter])

  const handleCardClick = (status: HealthStatus) => {
    setHealthFilter((prev) => (prev === status ? 'all' : status))
  }

  return (
    <AdminLayout>
      <Head title="Health das Escolas" />

      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Activity className="h-6 w-6" />
            Health das Escolas
          </h1>
          <p className="text-muted-foreground">
            Ativação, uso de features e escolas em risco de churn
          </p>
        </div>

        {isLoading ? (
          <SchoolHealthSkeleton />
        ) : data ? (
          <>
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              {(['healthy', 'warning', 'critical', 'inactive'] as const).map((status) => {
                const config = HEALTH_CONFIG[status]
                const Icon = config.icon
                const count = data.summary[status]
                const isActive = healthFilter === status
                return (
                  <Card
                    key={status}
                    className={cn(
                      'cursor-pointer transition-colors ring-1',
                      isActive ? 'ring-2 ring-primary' : 'ring-foreground/10 hover:bg-muted/30'
                    )}
                    onClick={() => handleCardClick(status)}
                  >
                    <CardContent className="flex items-center gap-3 py-4">
                      <span
                        className={cn('grid h-9 w-9 place-items-center rounded-lg', config.class)}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <div>
                        <p className="text-2xl font-semibold tabular-nums">{count}</p>
                        <p className="text-xs text-muted-foreground">{config.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card className="ring-1 ring-foreground/10">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>
                    Escolas ({filtered.length}
                    {filtered.length !== data.schools.length && ` de ${data.schools.length}`})
                  </CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Buscar escola..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 w-48"
                      />
                    </div>
                    <Select value={subFilter} onValueChange={(v) => setSubFilter(v ?? 'all')}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os planos</SelectItem>
                        <SelectItem value="ACTIVE">Ativo</SelectItem>
                        <SelectItem value="TRIAL">Trial</SelectItem>
                        <SelectItem value="BLOCKED">Bloqueado</SelectItem>
                        <SelectItem value="NONE">Sem plano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filtered.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Nenhuma escola encontrada com esses filtros.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Escola</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Health</TableHead>
                        <TableHead className="text-right">Alunos</TableHead>
                        <TableHead className="text-right">Logins 30d</TableHead>
                        <TableHead>Última atividade</TableHead>
                        <TableHead>Features</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((school: School) => {
                        const config = HEALTH_CONFIG[school.healthStatus as HealthStatus]
                        const Icon = config.icon
                        return (
                          <TableRow key={school.id}>
                            <TableCell className="font-medium">{school.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {SUBSCRIPTION_LABELS[school.subscriptionStatus] ??
                                  school.subscriptionStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 text-xs font-medium',
                                  config.class,
                                  'rounded-full px-2 py-0.5'
                                )}
                              >
                                <Icon className="h-3 w-3" />
                                {config.label}
                              </span>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {school.activeStudents}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {school.recentLogins}
                            </TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  'text-xs',
                                  school.healthStatus === 'critical' ||
                                    school.healthStatus === 'inactive'
                                    ? 'text-destructive font-medium'
                                    : 'text-muted-foreground'
                                )}
                              >
                                {formatDaysAgo(school.daysSinceActivity)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {school.featureAdoption.length > 0 ? (
                                  school.featureAdoption.map((f: string) => (
                                    <Badge
                                      key={f}
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0"
                                    >
                                      {f}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground">Nenhuma</span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </AdminLayout>
  )
}

function SchoolHealthSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}
