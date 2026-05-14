import type { ReactNode } from 'react'
import type { ToolUIPart } from 'ai'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Users, AlertTriangle, DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Friendly labels for SQL column aliases and snake_case/camelCase names that
// the model emits via queryDatabase. The model can't be trusted to alias
// columns consistently, so we translate on the way out. Keys are
// case-insensitive (we lowercase before lookup).
const COLUMN_LABELS: Record<string, string> = {
  id: 'ID',
  name: 'Nome',
  email: 'E-mail',
  phone: 'Telefone',
  status: 'Status',
  type: 'Tipo',
  qtd: 'Quantidade',
  total: 'Total',
  turma: 'Turma',
  class_name: 'Turma',
  total_alunos: 'Total de alunos',
  total_turmas: 'Total de turmas',
  total_professores: 'Total de professores',
  enrollmentstatus: 'Status',
  monthlypaymentamount: 'Mensalidade',
  overdueamount: 'Inadimplência',
  createdat: 'Criado em',
  updatedat: 'Atualizado em',
  duedate: 'Vencimento',
  // English aliases the model sometimes emits despite the PT-BR context
  student_name: 'Aluno',
  'student name': 'Aluno',
  studentname: 'Aluno',
  total_amount: 'Valor total',
  'total amount': 'Valor total',
  totalamount: 'Valor total',
  month: 'Mês',
  year: 'Ano',
  amount: 'Valor',
  description: 'Descrição',
  count: 'Quantidade',
}

// Discrete enum values the schema uses; mapping to PT-BR labels.
const VALUE_LABELS: Record<string, string> = {
  REGISTERED: 'Matriculado',
  PENDING: 'Pendente',
  PAID: 'Pago',
  OPEN: 'Em aberto',
  OVERDUE: 'Vencido',
  CANCELLED: 'Cancelado',
  RENEGOTIATED: 'Renegociado',
  MONTHLY: 'Mensal',
  ANNUAL: 'Anual',
  ENROLLMENT: 'Matrícula',
  high: 'Urgente',
  normal: 'Atenção',
}

// Columns whose integer values are in BRL cents and should render as money.
const MONEY_COLUMNS = new Set([
  'total',
  'amount',
  'valor',
  'monthlyPaymentAmount',
  'overdueAmount',
])

const MONEY_COLUMN_PATTERN = /centavos?\b|\bcents?\b|amount/i

function humanizeColumn(col: string): string {
  const lower = col.toLowerCase()
  if (COLUMN_LABELS[lower]) return COLUMN_LABELS[lower]
  // snake_case + camelCase fallback: space-out + capitalize first letter.
  // Strip "(centavos)" / "_cents" hints from the header — the formatted
  // value will read as BRL, the parenthetical only adds clutter.
  const stripped = col
    .replace(/\s*\(centavos?\)\s*/gi, '')
    .replace(/[_-]?cents?\b/gi, '')
    .trim()
  const spaced = stripped.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

// Detect ISO-8601 dates (with or without time) and format to pt-BR
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/

function formatIsoDate(raw: string): string {
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  // Only show time when it isn't midnight UTC (the common "date-only" case)
  const hasTime = !(d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(hasTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

function humanizeValue(col: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  const raw = String(value)
  if (VALUE_LABELS[raw]) return VALUE_LABELS[raw]
  const looksLikeMoney = MONEY_COLUMNS.has(col) || MONEY_COLUMN_PATTERN.test(col)
  if (looksLikeMoney && /^-?\d+$/.test(raw)) {
    return formatBRL(Number.parseInt(raw, 10))
  }
  if (ISO_DATE_RE.test(raw)) {
    return formatIsoDate(raw)
  }
  return raw
}

export function SchoolStatsCard({
  totalStudents,
  overdueAmountCents,
}: {
  totalStudents?: number
  overdueAmountCents?: number
}) {
  return (
    <div className="grid grid-cols-2 gap-3 py-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users className="h-4 w-4" />
            Total de Alunos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalStudents ?? 0}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <DollarSign className="h-4 w-4 text-red-500" />
            Inadimplência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-500">{formatBRL(overdueAmountCents ?? 0)}</p>
        </CardContent>
      </Card>
    </div>
  )
}

type StudentAlert = { student: string; description: string; priority: 'high' | 'normal' }

export function StudentAlertsCard({ alerts }: { alerts?: StudentAlert[] }) {
  if (!alerts?.length) return null
  return (
    <div className="space-y-2 py-2">
      {alerts.slice(0, 5).map((alert, i) => (
        <Card key={i} className={alert.priority === 'high' ? 'border-red-200' : ''}>
          <CardContent className="flex items-start gap-3 p-3">
            <AlertTriangle
              className={`h-4 w-4 mt-0.5 shrink-0 ${
                alert.priority === 'high' ? 'text-red-500' : 'text-yellow-500'
              }`}
            />
            <div className="text-sm min-w-0">
              <p className="font-medium truncate">{alert.student}</p>
              <p className="text-muted-foreground">{alert.description}</p>
            </div>
            <Badge
              variant={alert.priority === 'high' ? 'destructive' : 'secondary'}
              className="shrink-0 ml-auto"
            >
              {alert.priority === 'high' ? 'Urgente' : 'Atenção'}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

type DataRow = Record<string, unknown>

export function DataTable({
  columns,
  rows,
  columnLabels,
}: {
  columns?: string[]
  rows?: DataRow[]
  // Optional override map (col key → friendly label). When the model uses
  // formatRows, it passes this map through renderResult so the table doesn't
  // have to second-guess the header. Falls back to our client-side
  // humanizeColumn for raw queries.
  columnLabels?: Record<string, string>
}) {
  if (!rows?.length) return <p className="text-sm text-muted-foreground py-2">Nenhum dado.</p>
  const cols = columns ?? (rows[0] ? Object.keys(rows[0]) : [])
  function header(col: string): string {
    return columnLabels?.[col] ?? humanizeColumn(col)
  }
  return (
    <div className="overflow-x-auto rounded-lg border py-2 my-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {cols.map((col) => (
              <th key={col} className="px-3 py-2 text-left font-medium text-muted-foreground">
                {header(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map((col) => (
                <td key={col} className="px-3 py-2">
                  {humanizeValue(col, row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function QueryResultCard({ rows, rowCount }: { rows?: DataRow[]; rowCount?: number }) {
  if (!rows?.length) {
    return <p className="text-sm text-muted-foreground py-2">Nenhum resultado encontrado.</p>
  }
  return (
    <div className="overflow-x-auto rounded-lg border py-2">
      <DataTable rows={rows} />
      <p className="px-3 py-1 text-xs text-muted-foreground">{rowCount ?? rows.length} resultado(s)</p>
    </div>
  )
}

export function InfoCard({
  title,
  description,
  value,
}: {
  title?: string
  description?: string
  value?: string | number
}) {
  return (
    <Card className="my-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

export type StatTone = 'neutral' | 'positive' | 'negative' | 'warning'

export function Stat({
  label,
  value,
  delta,
  deltaLabel,
  tone = 'neutral',
  hint,
}: {
  label?: string
  value?: string | number
  delta?: number
  deltaLabel?: string
  tone?: StatTone
  hint?: string
}) {
  const toneClass = {
    neutral: 'text-foreground',
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
  }[tone]

  const TrendIcon = delta !== undefined && delta < 0 ? TrendingDown : TrendingUp

  return (
    <Card className="my-2">
      <CardContent className="p-4">
        {label && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
        )}
        <p className={cn('text-3xl font-bold mt-1', toneClass)}>{value ?? '—'}</p>
        {(delta !== undefined || deltaLabel) && (
          <div className="flex items-center gap-1 mt-2 text-xs">
            {delta !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-1',
                  delta >= 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {delta > 0 ? '+' : ''}
                {delta}%
              </span>
            )}
            {deltaLabel && <span className="text-muted-foreground">{deltaLabel}</span>}
          </div>
        )}
        {hint && <p className="text-xs text-muted-foreground mt-2">{hint}</p>}
      </CardContent>
    </Card>
  )
}

type ComparisonPoint = {
  value?: number
  secondaryValue?: number
  secondaryUnit?: string
}

type ComparisonBreakdownItem = {
  id?: string
  label?: string
  now?: number
  then?: number
  delta?: number
  deltaPct?: number | null
}

type ComparisonBreakdown = {
  by?: 'class'
  items?: ComparisonBreakdownItem[]
}

export function Comparison({
  title,
  label,
  unit,
  now,
  then,
  deltaPct,
  direction,
  isImprovement,
  periodLabel,
  breakdown,
}: {
  title?: string
  label?: string
  unit?: string
  now?: ComparisonPoint
  then?: ComparisonPoint
  deltaPct?: number | null
  direction?: 'up' | 'down' | 'flat'
  isImprovement?: boolean
  periodLabel?: string
  breakdown?: ComparisonBreakdown
}) {
  const nowValue = now?.value ?? 0
  const thenValue = then?.value ?? 0
  const dir = direction ?? (nowValue === thenValue ? 'flat' : nowValue > thenValue ? 'up' : 'down')
  const TrendIcon = dir === 'flat' ? Minus : dir === 'up' ? TrendingUp : TrendingDown
  // Cor é função de "melhorou ou piorou", não da direção crua. Para overdue
  // ou faltas, descer é verde; para matrículas/comunicados, subir é verde.
  const improvement =
    typeof isImprovement === 'boolean'
      ? isImprovement
      : dir === 'flat'

  const deltaColor =
    dir === 'flat'
      ? 'text-muted-foreground'
      : improvement
        ? 'text-green-600 dark:text-green-400'
        : 'text-red-600 dark:text-red-400'

  const pctLabel =
    deltaPct === null || deltaPct === undefined
      ? 'sem base de comparação'
      : `${deltaPct > 0 ? '+' : ''}${deltaPct.toFixed(1)}%`

  return (
    <Card className="my-2">
      {(title || label) && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title ?? label}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold tabular-nums text-foreground">
            {nowValue.toLocaleString('pt-BR')}
          </p>
          {unit ? <p className="text-sm text-muted-foreground">{unit}</p> : null}
        </div>
        {now?.secondaryValue !== undefined && now.secondaryUnit === 'centavos' ? (
          <p className="text-sm text-muted-foreground">{formatBRL(now.secondaryValue)}</p>
        ) : now?.secondaryValue !== undefined ? (
          <p className="text-sm text-muted-foreground">
            {now.secondaryValue.toLocaleString('pt-BR')} {now.secondaryUnit ?? ''}
          </p>
        ) : null}
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className={cn('inline-flex items-center gap-1 font-medium', deltaColor)}>
            <TrendIcon className="h-3.5 w-3.5" />
            {pctLabel}
          </span>
          <span className="text-muted-foreground">
            vs {periodLabel ?? 'período anterior'} ({thenValue.toLocaleString('pt-BR')}{' '}
            {unit ?? ''})
          </span>
        </div>
        {breakdown?.items && breakdown.items.length > 0 ? (
          <div className="mt-3 border-t border-border pt-3">
            <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Maiores variações por turma
            </div>
            <div className="space-y-1">
              {breakdown.items.map((item, i) => {
                const delta = item.delta ?? (item.now ?? 0) - (item.then ?? 0)
                const itemDir = delta === 0 ? 'flat' : delta > 0 ? 'up' : 'down'
                const ItemIcon = itemDir === 'flat' ? Minus : itemDir === 'up' ? TrendingUp : TrendingDown
                // Mesma heurística: se o agregado sobe e isImprovement=false,
                // então subir item-a-item também é ruim.
                const itemIsBad =
                  itemDir !== 'flat' &&
                  ((itemDir === 'up' && improvement === false) ||
                    (itemDir === 'down' && improvement === true))
                const itemColor =
                  itemDir === 'flat'
                    ? 'text-muted-foreground'
                    : itemIsBad
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                return (
                  <div
                    key={item.id ?? i}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="truncate text-foreground">{item.label ?? '—'}</span>
                    <span className="flex items-center gap-1.5 tabular-nums text-muted-foreground">
                      <span>
                        {(item.now ?? 0).toLocaleString('pt-BR')} (era{' '}
                        {(item.then ?? 0).toLocaleString('pt-BR')})
                      </span>
                      <span className={cn('inline-flex items-center gap-0.5 font-medium', itemColor)}>
                        <ItemIcon className="h-3 w-3" />
                        {delta > 0 ? '+' : ''}
                        {delta}
                      </span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

const CHART_COLORS = [
  'hsl(262, 83%, 58%)',
  'hsl(199, 89%, 48%)',
  'hsl(142, 71%, 45%)',
  'hsl(35, 92%, 51%)',
  'hsl(346, 87%, 60%)',
  'hsl(173, 80%, 40%)',
]

export type ChartType = 'bar' | 'line' | 'pie'
type ChartPoint = { label?: string; value?: number } & Record<string, unknown>

export function Chart({
  type = 'bar',
  data,
  xKey = 'label',
  yKey = 'value',
  title,
  height = 240,
}: {
  type?: ChartType
  data?: ChartPoint[]
  xKey?: string
  yKey?: string
  title?: string
  height?: number
}) {
  if (!data?.length) {
    return <p className="text-sm text-muted-foreground py-2">Sem dados pra exibir.</p>
  }
  return (
    <Card className="my-2">
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={height}>
          {type === 'pie' ? (
            <PieChart>
              <Tooltip />
              <Pie
                data={data}
                dataKey={yKey}
                nameKey={xKey}
                outerRadius={Math.min(height / 2 - 20, 100)}
                label
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          ) : type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey={xKey} className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Line type="monotone" dataKey={yKey} stroke={CHART_COLORS[0]} strokeWidth={2} />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey={xKey} className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar dataKey={yKey} fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function Grid({ children, columns = 2 }: { children?: ReactNode; columns?: 1 | 2 | 3 | 4 }) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns]
  return <div className={cn('grid gap-3 my-2', gridClass)}>{children}</div>
}

const componentRegistry: Record<string, (props: Record<string, unknown>) => ReactNode> = {
  SchoolStatsCard: (p) => <SchoolStatsCard {...(p as Parameters<typeof SchoolStatsCard>[0])} />,
  StudentAlertsCard: (p) => <StudentAlertsCard {...(p as Parameters<typeof StudentAlertsCard>[0])} />,
  DataTable: (p) => <DataTable {...(p as Parameters<typeof DataTable>[0])} />,
  InfoCard: (p) => <InfoCard {...(p as Parameters<typeof InfoCard>[0])} />,
  Stat: (p) => <Stat {...(p as Parameters<typeof Stat>[0])} />,
  Chart: (p) => <Chart {...(p as Parameters<typeof Chart>[0])} />,
  Comparison: (p) => <Comparison {...(p as Parameters<typeof Comparison>[0])} />,
}

type ToolRenderer = (args: {
  input: unknown
  output: unknown
  state: ToolUIPart['state']
}) => ReactNode

function getProp<T>(obj: unknown, key: string): T | undefined {
  if (obj && typeof obj === 'object' && key in obj) {
    return (obj as Record<string, unknown>)[key] as T
  }
  return undefined
}

// We only render the FINAL visual via renderResult. Intermediate tool
// outputs (getSchoolStats, getStudentAlerts, queryDatabase, formatRows) are
// shown as step labels only — rendering their raw output here too duplicates
// the card/table on screen, since the model already calls renderResult to
// produce the canonical visual.
export const toolComponents: Record<string, ToolRenderer> = {
  renderResult: ({ input }) => {
    const component = getProp<string>(input, 'component')
    const data = getProp<Record<string, unknown>>(input, 'data') ?? {}
    const title = getProp<string>(input, 'title')
    if (!component) return null
    const render = componentRegistry[component]
    if (!render) return null
    return render({ ...data, title })
  },
}

