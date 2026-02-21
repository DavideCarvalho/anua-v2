import { useState, useMemo, useCallback, useRef, useEffect, Fragment } from 'react'
import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useQueryStates, parseAsInteger, parseAsString, parseAsArrayOf } from 'nuqs'
import { DateTime } from 'luxon'
import type { LucideIcon } from 'lucide-react'
import { useInvoicesQueryOptions, type InvoicesResponse } from '../hooks/queries/use_invoices'
import { useStudentsQueryOptions } from '../hooks/queries/use_students'
import { useAcademicPeriodsQueryOptions } from '../hooks/queries/use_academic_periods'
import { tuyau } from '../lib/api'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import {
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Handshake,
  FilterX,
  RefreshCw,
  Loader2,
  X,
  Users,
  History,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { Checkbox } from '../components/ui/checkbox'
import { Badge } from '../components/ui/badge'
import { formatCurrency } from '../lib/utils'
import { MarkInvoicePaidModal } from './invoices/mark-invoice-paid-modal'
import { CreateAgreementModal } from './invoices/create-agreement-modal'
import { MarkPaidModal } from './student-payments/mark-paid-modal'
import { AuditHistoryModal } from '../components/audit-history-modal'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

type SelectedStudent = { id: string; name: string }

function StudentMultiSelect({
  selectedStudents,
  onChange,
  academicPeriodId,
  courseId,
  classId,
}: {
  selectedStudents: SelectedStudent[]
  onChange: (students: SelectedStudent[]) => void
  academicPeriodId?: string | null
  courseId?: string | null
  classId?: string | null
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: studentsData, isLoading } = useQuery({
    ...useStudentsQueryOptions({
      search: debouncedSearch || undefined,
      academicPeriodId: academicPeriodId || undefined,
      courseId: courseId || undefined,
      classId: classId || undefined,
      limit: 15,
    }),
    enabled: open,
  })

  const students: StudentOption[] = (studentsData?.data ?? []) as StudentOption[]

  const selectedIds = useMemo(() => new Set(selectedStudents.map((s) => s.id)), [selectedStudents])

  const toggleStudent = useCallback(
    (student: { id: string; user?: { name?: string } }) => {
      const name = student.user?.name || '-'
      if (selectedIds.has(student.id)) {
        onChange(selectedStudents.filter((s) => s.id !== student.id))
      } else {
        onChange([...selectedStudents, { id: student.id, name }])
      }
    },
    [selectedIds, selectedStudents, onChange]
  )

  const removeStudent = useCallback(
    (id: string) => {
      onChange(selectedStudents.filter((s) => s.id !== id))
    },
    [selectedStudents, onChange]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="min-w-48 justify-between h-auto min-h-9">
          {selectedStudents.length === 0 ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              Alunos
            </span>
          ) : (
            <span className="flex items-center gap-1 flex-wrap">
              {selectedStudents.length === 1 ? (
                <span className="truncate max-w-32">{selectedStudents[0].name}</span>
              ) : (
                <span>{selectedStudents.length} alunos</span>
              )}
            </span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        {selectedStudents.length > 0 && (
          <div className="p-2 border-b flex flex-wrap gap-1">
            {selectedStudents.map((s) => (
              <Badge key={s.id} variant="secondary" className="gap-1 pr-1">
                <span className="truncate max-w-24 text-xs">{s.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeStudent(s.id)
                  }}
                  className="rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="max-h-48 overflow-y-auto p-1">
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && students.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {debouncedSearch ? 'Nenhum aluno encontrado' : 'Digite para buscar'}
            </p>
          )}

          {!isLoading &&
            students.map((student) => (
              <label
                key={student.id}
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-muted"
              >
                <Checkbox
                  checked={selectedIds.has(student.id)}
                  onCheckedChange={() => toggleStudent(student)}
                />
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{student.user?.name || '-'}</span>
                  {student.user?.email && (
                    <span className="text-xs text-muted-foreground truncate">
                      {student.user.email}
                    </span>
                  )}
                </div>
              </label>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Loading Skeleton
function InvoicesSkeleton() {
  return (
    <div className="border rounded-lg">
      <div className="p-4 border-b">
        <div className="grid grid-cols-8 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="p-4 border-b last:border-0">
          <div className="grid grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, j) => (
              <div key={j} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Error Fallback
function InvoicesErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex items-center gap-4 py-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="flex-1">
          <h3 className="font-semibold text-destructive">Erro ao carregar faturas</h3>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Ocorreu um erro inesperado'}
          </p>
        </div>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}

type InvoiceStatus = 'OPEN' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'RENEGOTIATED'
type StatusConfig = { label: string; className: string; icon: LucideIcon }

const statusConfig: Record<InvoiceStatus, StatusConfig> = {
  OPEN: { label: 'Aberta', className: 'bg-blue-100 text-blue-700', icon: Clock },
  PENDING: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
  PAID: { label: 'Paga', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  OVERDUE: { label: 'Vencida', className: 'bg-red-100 text-red-700', icon: AlertTriangle },
  CANCELLED: { label: 'Cancelada', className: 'bg-gray-100 text-gray-700', icon: XCircle },
  RENEGOTIATED: {
    label: 'Renegociada',
    className: 'bg-purple-100 text-purple-700',
    icon: RefreshCw,
  },
}

function getPaymentDescription(payment: InvoicePaymentRecord): string {
  const contractName = payment.contract?.name
  const installmentInfo =
    payment.installments > 0 ? ` (${payment.installmentNumber}/${payment.installments})` : ''

  switch (payment.type) {
    case 'TUITION':
      return 'Mensalidade'
    case 'ENROLLMENT':
      return contractName
        ? `Matrícula - ${contractName}${installmentInfo}`
        : `Matrícula${installmentInfo}`
    case 'EXTRA_CLASS':
      return payment.studentHasExtraClass?.extraClass?.name
        ? `Aula Avulsa - ${payment.studentHasExtraClass.extraClass.name}`
        : 'Aula Avulsa'
    case 'COURSE':
      return contractName ? `Curso - ${contractName}` : 'Curso'
    case 'STORE':
      return 'Loja'
    case 'CANTEEN':
      return 'Cantina'
    case 'AGREEMENT':
      return 'Acordo'
    case 'STUDENT_LOAN':
      return 'Empréstimo'
    default:
      return 'Outro'
  }
}

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  NOT_PAID: { label: 'Não pago', className: 'bg-gray-100 text-gray-700' },
  PENDING: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700' },
  PAID: { label: 'Pago', className: 'bg-green-100 text-green-700' },
  OVERDUE: { label: 'Vencido', className: 'bg-red-100 text-red-700' },
  CANCELLED: { label: 'Cancelado', className: 'bg-gray-100 text-gray-700' },
  FAILED: { label: 'Falhou', className: 'bg-red-100 text-red-700' },
  RENEGOTIATED: { label: 'Renegociado', className: 'bg-purple-100 text-purple-700' },
}

const monthLabels = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

type Invoice = InvoicesResponse['data'][number]
type InvoicePayment = NonNullable<Invoice['payments']>[number]
type PaginationMeta = InvoicesResponse['meta']
type StudentOption = { id: string; user?: { name?: string; email?: string } }
type AcademicPeriodOption = { id: string; name: string }
type CourseLevel = {
  id: string
  levelId: string
  name: string
  classes: { id: string; name: string }[]
}
type AcademicPeriodCourse = { id: string; courseId: string; name: string; levels: CourseLevel[] }

type InvoicePaymentRecord = InvoicePayment & {
  contract?: { name?: string }
}

type InvoiceRecord = Invoice & {
  studentId?: string
  student?: { user?: { name?: string } }
  payments?: InvoicePaymentRecord[]
  baseAmount?: number | string | null
  discountAmount?: number | string | null
  fineAmount?: number | string | null
  interestAmount?: number | string | null
  nfseStatus?: string | null
  nfsePdfUrl?: string | null
  nfseXmlUrl?: string | null
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'

  if (typeof date === 'string') {
    const datePart = date.slice(0, 10)
    const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`
    }
    return new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  }

  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

function getDaysOverdue(dueDate: string | Date | null | undefined): number {
  if (!dueDate) return 0

  const parsed =
    typeof dueDate === 'string' ? DateTime.fromISO(dueDate) : DateTime.fromJSDate(dueDate)
  if (!parsed.isValid) return 0

  const today = DateTime.now().startOf('day')
  const due = parsed.startOf('day')
  const days = Math.floor(today.diff(due, 'days').days)

  return Math.max(days, 0)
}

const nfseStatusConfig: Record<string, { label: string; className: string }> = {
  AUTHORIZED: { label: 'NFS-e', className: 'bg-green-100 text-green-700' },
  SCHEDULED: { label: 'NFS-e pendente', className: 'bg-yellow-100 text-yellow-700' },
  ERROR: { label: 'NFS-e erro', className: 'bg-red-100 text-red-700' },
  CANCELLED: { label: 'NFS-e cancelada', className: 'bg-gray-100 text-gray-700' },
  PROCESSING_CANCELLATION: { label: 'NFS-e cancelando', className: 'bg-gray-100 text-gray-700' },
  CANCELLATION_DENIED: { label: 'NFS-e canc. negada', className: 'bg-gray-100 text-gray-700' },
}

const ACTIONABLE_STATUSES: InvoiceStatus[] = ['OPEN', 'PENDING', 'OVERDUE']
const ACTIONABLE_PAYMENT_STATUSES = ['NOT_PAID', 'PENDING', 'OVERDUE']

// Container Export
export function InvoicesContainer() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <InvoicesErrorFallback error={error as Error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <InvoicesContent />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

type ModalType = 'mark-paid' | 'agreement' | null
type SortableColumn =
  | 'dueDate'
  | 'baseAmount'
  | 'discountAmount'
  | 'totalAmount'
  | 'status'
  | 'month'
  | 'year'

function InvoicesContent() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [selectedStudents, setSelectedStudents] = useState<SelectedStudent[]>([])
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [selectedPaymentForAction, setSelectedPaymentForAction] = useState<{
    payment: InvoicePaymentRecord
    student: InvoiceRecord['student']
  } | null>(null)
  const [historyInvoiceId, setHistoryInvoiceId] = useState<string | null>(null)

  function openModal(invoice: Invoice, modal: ModalType) {
    setSelectedInvoice(invoice)
    setActiveModal(modal)
  }

  function closeModal() {
    setActiveModal(null)
    setSelectedInvoice(null)
  }

  const DEFAULT_STATUSES: InvoiceStatus[] = ['OPEN', 'PENDING', 'OVERDUE']

  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    studentIds: parseAsArrayOf(parseAsString),
    status: parseAsArrayOf(parseAsString).withDefault(DEFAULT_STATUSES),
    academicPeriodId: parseAsString,
    courseId: parseAsString,
    classId: parseAsString,
    sortBy: parseAsString,
    sortDirection: parseAsString,
    month: parseAsInteger,
    year: parseAsInteger,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  })

  const {
    studentIds: filterStudentIds,
    page,
    limit,
    status: filterStatuses,
    academicPeriodId: filterAcademicPeriodId,
    courseId: filterCourseId,
    classId: filterClassId,
    sortBy: filterSortBy,
    sortDirection: filterSortDirection,
    month: filterMonth,
    year: filterYear,
  } = filters

  const { data: academicPeriodsData } = useQuery({
    ...useAcademicPeriodsQueryOptions({ limit: 100 }),
  })
  const academicPeriods: AcademicPeriodOption[] = (academicPeriodsData?.data ??
    []) as AcademicPeriodOption[]

  const { data: coursesData } = useQuery({
    queryKey: ['invoice-academic-period-courses', filterAcademicPeriodId],
    queryFn: async () => {
      const response = await tuyau.api.v1['academic-periods']({
        id: filterAcademicPeriodId!,
      }).courses.$get()
      if (response.error) throw new Error('Erro ao carregar cursos')
      return response.data as AcademicPeriodCourse[]
    },
    enabled: !!filterAcademicPeriodId,
  })
  const courses = coursesData ?? []

  const classes = useMemo(() => {
    if (!filterCourseId || courses.length === 0) return []
    const selectedCourse = courses.find((course) => course.courseId === filterCourseId)
    if (!selectedCourse) return []

    return selectedCourse.levels.flatMap((level) =>
      level.classes.map((cls) => ({ ...cls, levelName: level.name }))
    )
  }, [courses, filterCourseId])

  const sortableColumns: SortableColumn[] = [
    'dueDate',
    'baseAmount',
    'discountAmount',
    'totalAmount',
    'status',
    'month',
    'year',
  ]
  const activeSortBy: SortableColumn =
    filterSortBy && sortableColumns.includes(filterSortBy as SortableColumn)
      ? (filterSortBy as SortableColumn)
      : 'dueDate'
  const activeSortDirection: 'asc' | 'desc' = filterSortDirection === 'desc' ? 'desc' : 'asc'

  const { data, isLoading, error, refetch } = useQuery(
    useInvoicesQueryOptions({
      page,
      limit,
      studentIds:
        filterStudentIds && filterStudentIds.length > 0 ? filterStudentIds.join(',') : undefined,
      status: filterStatuses.length > 0 ? filterStatuses.join(',') : undefined,
      academicPeriodId: filterAcademicPeriodId || undefined,
      courseId: filterCourseId || undefined,
      classId: filterClassId || undefined,
      sortBy: activeSortBy,
      sortDirection: activeSortDirection,
      month: filterMonth || undefined,
      year: filterYear || undefined,
    })
  )

  function toggleSort(column: SortableColumn) {
    if (activeSortBy !== column) {
      setFilters({ sortBy: column, sortDirection: 'asc', page: 1 })
      return
    }

    setFilters({
      sortBy: column,
      sortDirection: activeSortDirection === 'asc' ? 'desc' : 'asc',
      page: 1,
    })
  }

  function sortIcon(column: SortableColumn) {
    if (activeSortBy !== column) return <ArrowUpDown className="h-3.5 w-3.5" />
    return activeSortDirection === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    )
  }

  // Hydrate selectedStudents from invoice data when URL has studentIds but UI state is empty
  useEffect(() => {
    if (
      selectedStudents.length === 0 &&
      filterStudentIds &&
      filterStudentIds.length > 0 &&
      data?.data &&
      data.data.length > 0
    ) {
      const idsSet = new Set(filterStudentIds)
      const seen = new Set<string>()
      const hydrated: SelectedStudent[] = []
      for (const invoice of data.data) {
        const studentId = (invoice as InvoiceRecord).studentId
        if (studentId && idsSet.has(studentId) && !seen.has(studentId)) {
          seen.add(studentId)
          hydrated.push({
            id: studentId,
            name: (invoice as InvoiceRecord).student?.user?.name || '-',
          })
        }
      }
      if (hydrated.length > 0) {
        setSelectedStudents(hydrated)
      }
    }
  }, [data, filterStudentIds, selectedStudents.length])

  function handleStudentsChange(students: SelectedStudent[]) {
    setSelectedStudents(students)
    setFilters({
      studentIds: students.length > 0 ? students.map((s) => s.id) : null,
      page: 1,
    })
  }

  function toggleStatus(value: string) {
    const current = filterStatuses || []
    const next = current.includes(value) ? current.filter((s) => s !== value) : [...current, value]
    setFilters({ status: next.length > 0 ? next : null, page: 1 })
  }

  const isDefaultStatuses =
    filterStatuses.length === DEFAULT_STATUSES.length &&
    DEFAULT_STATUSES.every((s) => filterStatuses.includes(s))

  const hasActiveFilters = !!(
    !isDefaultStatuses ||
    filterMonth ||
    filterYear ||
    filterAcademicPeriodId ||
    filterCourseId ||
    filterClassId ||
    (filterStudentIds && filterStudentIds.length > 0)
  )

  function clearFilters() {
    setSelectedStudents([])
    setFilters({
      status: DEFAULT_STATUSES,
      academicPeriodId: null,
      courseId: null,
      classId: null,
      sortBy: 'dueDate',
      sortDirection: 'asc',
      month: null,
      year: null,
      studentIds: null,
      page: 1,
    })
  }

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const invoices: InvoiceRecord[] = (data?.data ?? []) as InvoiceRecord[]
  const meta: PaginationMeta | undefined = data?.meta

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <StudentMultiSelect
          selectedStudents={selectedStudents}
          onChange={handleStudentsChange}
          academicPeriodId={filterAcademicPeriodId}
          courseId={filterCourseId}
          classId={filterClassId}
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-48 justify-between">
              {filterStatuses.length === 0 ? (
                <span className="text-muted-foreground">Status</span>
              ) : filterStatuses.length === Object.keys(statusConfig).length ? (
                <span>Todos status</span>
              ) : (
                <span className="truncate">
                  {filterStatuses.length === 1
                    ? statusConfig[filterStatuses[0] as InvoiceStatus]?.label
                    : `${filterStatuses.length} status`}
                </span>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-1">
              {Object.entries(statusConfig).map(([value, config]) => (
                <label
                  key={value}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-muted"
                >
                  <Checkbox
                    checked={filterStatuses.includes(value)}
                    onCheckedChange={() => toggleStatus(value)}
                  />
                  {config.label}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Select
          value={filterAcademicPeriodId || 'all'}
          onValueChange={(v) =>
            setFilters({
              academicPeriodId: v === 'all' ? null : v,
              courseId: null,
              classId: null,
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Período letivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os períodos</SelectItem>
            {academicPeriods.map((period) => (
              <SelectItem key={period.id} value={period.id}>
                {period.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterCourseId || 'all'}
          onValueChange={(v) =>
            setFilters({
              courseId: v === 'all' ? null : v,
              classId: null,
              page: 1,
            })
          }
          disabled={!filterAcademicPeriodId}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cursos</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.courseId} value={course.courseId}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterClassId || 'all'}
          onValueChange={(v) => setFilters({ classId: v === 'all' ? null : v, page: 1 })}
          disabled={!filterCourseId}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Turma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as turmas</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name} ({cls.levelName})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterMonth?.toString() || '_all'}
          onValueChange={(v) => setFilters({ month: v === '_all' ? null : Number(v), page: 1 })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todos meses</SelectItem>
            {monthLabels.map((label, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterYear?.toString() || '_all'}
          onValueChange={(v) => setFilters({ year: v === '_all' ? null : Number(v), page: 1 })}
        >
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todos anos</SelectItem>
            {[2024, 2025, 2026].map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            <FilterX className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {isLoading && <InvoicesSkeleton />}

      {error && <InvoicesErrorFallback error={error} resetErrorBoundary={() => refetch()} />}

      {!isLoading && !error && invoices.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma fatura encontrada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              As faturas dos alunos aparecerão aqui quando forem geradas
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && invoices.length > 0 && (
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] md:min-w-0">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="w-10 p-4" />
                    <th className="text-left p-4 font-medium">Aluno</th>
                    <th className="text-left p-4 font-medium">Referência</th>
                    <th className="text-left p-4 font-medium">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 hover:text-foreground"
                        onClick={() => toggleSort('dueDate')}
                      >
                        Vencimento
                        {sortIcon('dueDate')}
                      </button>
                    </th>
                    <th className="text-right p-4 font-medium hidden md:table-cell">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 hover:text-foreground"
                        onClick={() => toggleSort('baseAmount')}
                      >
                        Valor Base
                        {sortIcon('baseAmount')}
                      </button>
                    </th>
                    <th className="text-right p-4 font-medium hidden md:table-cell">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 hover:text-foreground"
                        onClick={() => toggleSort('discountAmount')}
                      >
                        Descontos
                        {sortIcon('discountAmount')}
                      </button>
                    </th>
                    <th className="text-right p-4 font-medium hidden md:table-cell">Encargos</th>
                    <th className="text-right p-4 font-medium">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 hover:text-foreground"
                        onClick={() => toggleSort('totalAmount')}
                      >
                        Valor Final
                        {sortIcon('totalAmount')}
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 hover:text-foreground"
                        onClick={() => toggleSort('status')}
                      >
                        Status
                        {sortIcon('status')}
                      </button>
                    </th>
                    <th className="text-right p-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    const config = statusConfig[(invoice.status as InvoiceStatus) || 'OPEN']
                    const StatusIcon = config.icon
                    const isExpanded = expandedRows.has(invoice.id)
                    const payments = invoice.payments ?? []
                    const discountAmount = Number(invoice.discountAmount || 0)
                    const fineAmount = Number(invoice.fineAmount || 0)
                    const interestAmount = Number(invoice.interestAmount || 0)
                    const surchargeTotal = fineAmount + interestAmount
                    const daysOverdue = getDaysOverdue(invoice.dueDate)

                    return (
                      <Fragment key={invoice.id}>
                        <tr
                          className="border-t hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => toggleRow(invoice.id)}
                        >
                          <td className="p-4 w-10">
                            <ChevronRight
                              className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                                {invoice.student?.user?.name?.charAt(0) || 'A'}
                              </div>
                              <div>
                                <span className="font-medium">
                                  {invoice.student?.user?.name || '-'}
                                </span>
                                {payments.length > 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    {payments.length} {payments.length === 1 ? 'item' : 'itens'}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {invoice.month && invoice.year
                              ? `${monthLabels[(invoice.month as number) - 1]} ${invoice.year}`
                              : '-'}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {formatDate(invoice.dueDate)}
                          </td>
                          <td className="p-4 text-right text-muted-foreground hidden md:table-cell">
                            {formatCurrency(Number(invoice.baseAmount || 0))}
                          </td>
                          <td className="p-4 text-right hidden md:table-cell">
                            {discountAmount > 0 ? (
                              <span className="text-green-600">
                                -{formatCurrency(discountAmount)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-4 text-right hidden md:table-cell">
                            {surchargeTotal > 0 ? (
                              <div className="inline-flex flex-col items-end gap-0.5">
                                <span className="font-medium text-orange-600">
                                  +{formatCurrency(surchargeTotal)}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  multa {formatCurrency(fineAmount)} + juros{' '}
                                  {formatCurrency(interestAmount)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-4 text-right font-semibold">
                            <div className="inline-flex flex-col items-end gap-0.5">
                              <span>{formatCurrency(Number(invoice.totalAmount || 0))}</span>
                              <div className="md:hidden text-[11px] font-normal text-muted-foreground">
                                <span>Base {formatCurrency(Number(invoice.baseAmount || 0))}</span>
                                {discountAmount > 0 && (
                                  <span className="ml-2 text-green-600">
                                    - {formatCurrency(discountAmount)}
                                  </span>
                                )}
                                {surchargeTotal > 0 && (
                                  <span className="ml-2 text-orange-600">
                                    + {formatCurrency(surchargeTotal)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${config.className}`}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {config.label}
                              </span>
                              {invoice.status === 'OVERDUE' && daysOverdue > 0 && (
                                <span className="text-[10px] text-orange-700">
                                  {daysOverdue} dias de atraso
                                </span>
                              )}
                              {invoice.nfseStatus &&
                                nfseStatusConfig[
                                  invoice.nfseStatus as keyof typeof nfseStatusConfig
                                ] && (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium w-fit ${nfseStatusConfig[invoice.nfseStatus as keyof typeof nfseStatusConfig].className}`}
                                  >
                                    {
                                      nfseStatusConfig[
                                        invoice.nfseStatus as keyof typeof nfseStatusConfig
                                      ].label
                                    }
                                  </span>
                                )}
                            </div>
                          </td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            {ACTIONABLE_STATUSES.includes(invoice.status as InvoiceStatus) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openModal(invoice, 'mark-paid')}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Marcar como paga
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openModal(invoice, 'agreement')}>
                                    <Handshake className="h-4 w-4 mr-2" />
                                    Renegociar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setHistoryInvoiceId(invoice.id)}>
                                    <History className="h-4 w-4 mr-2" />
                                    Ver historico
                                  </DropdownMenuItem>
                                  {invoice.nfseStatus === 'AUTHORIZED' && invoice.nfsePdfUrl && (
                                    <DropdownMenuItem asChild>
                                      <a
                                        href={invoice.nfsePdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Download className="h-4 w-4 mr-2" />
                                        Baixar NFS-e (PDF)
                                      </a>
                                    </DropdownMenuItem>
                                  )}
                                  {invoice.nfseStatus === 'AUTHORIZED' && invoice.nfseXmlUrl && (
                                    <DropdownMenuItem asChild>
                                      <a
                                        href={invoice.nfseXmlUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Baixar NFS-e (XML)
                                      </a>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                            {!ACTIONABLE_STATUSES.includes(invoice.status as InvoiceStatus) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setHistoryInvoiceId(invoice.id)}>
                                    <History className="h-4 w-4 mr-2" />
                                    Ver historico
                                  </DropdownMenuItem>
                                  {invoice.nfseStatus === 'AUTHORIZED' && invoice.nfsePdfUrl && (
                                    <DropdownMenuItem asChild>
                                      <a
                                        href={invoice.nfsePdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Download className="h-4 w-4 mr-2" />
                                        Baixar NFS-e (PDF)
                                      </a>
                                    </DropdownMenuItem>
                                  )}
                                  {invoice.nfseStatus === 'AUTHORIZED' && invoice.nfseXmlUrl && (
                                    <DropdownMenuItem asChild>
                                      <a
                                        href={invoice.nfseXmlUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Baixar NFS-e (XML)
                                      </a>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr key={`${invoice.id}-expanded`} className="border-t">
                            <td colSpan={10} className="p-0">
                              <div className="bg-muted/20 px-6 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                {payments.length === 0 ? (
                                  <p className="text-sm text-muted-foreground py-2">
                                    Nenhum pagamento vinculado a esta fatura
                                  </p>
                                ) : (
                                  <div className="space-y-3">
                                    <div className="rounded-md border bg-background px-4 py-3">
                                      <p className="text-xs font-medium text-muted-foreground mb-2">
                                        Composição da fatura
                                      </p>
                                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5 text-sm">
                                        <div className="flex items-center justify-between gap-3 lg:block">
                                          <span className="text-muted-foreground">Valor base</span>
                                          <p className="font-medium text-foreground">
                                            {formatCurrency(Number(invoice.baseAmount || 0))}
                                          </p>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 lg:block">
                                          <span className="text-muted-foreground">Desconto</span>
                                          <p className="font-medium text-green-600">
                                            {discountAmount > 0
                                              ? `-${formatCurrency(discountAmount)}`
                                              : '-'}
                                          </p>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 lg:block">
                                          <span className="text-muted-foreground">Multa</span>
                                          <p className="font-medium text-orange-600">
                                            {fineAmount > 0
                                              ? `+${formatCurrency(fineAmount)}`
                                              : '-'}
                                          </p>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 lg:block">
                                          <span className="text-muted-foreground">Juros</span>
                                          <p className="font-medium text-orange-600">
                                            {interestAmount > 0
                                              ? `+${formatCurrency(interestAmount)}`
                                              : '-'}
                                          </p>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 lg:block lg:border-l lg:pl-4">
                                          <span className="text-muted-foreground">Total atual</span>
                                          <p className="font-semibold text-foreground">
                                            {formatCurrency(Number(invoice.totalAmount || 0))}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    <table className="w-full">
                                      <thead>
                                        <tr className="text-xs text-muted-foreground">
                                          <th className="text-left py-2 px-3 font-medium">Tipo</th>
                                          <th className="text-left py-2 px-3 font-medium">
                                            Referência
                                          </th>
                                          <th className="text-left py-2 px-3 font-medium">Valor</th>
                                          <th className="text-left py-2 px-3 font-medium">
                                            Status
                                          </th>
                                          <th className="text-right py-2 px-3 font-medium">
                                            Ações
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {payments.map((payment) => {
                                          const pConfig = paymentStatusConfig[payment.status] ?? {
                                            label: payment.status,
                                            className: 'bg-gray-100 text-gray-700',
                                          }
                                          return (
                                            <tr
                                              key={payment.id}
                                              className="border-t border-muted text-sm"
                                            >
                                              <td className="py-2 px-3">
                                                {getPaymentDescription(payment)}
                                              </td>
                                              <td className="py-2 px-3 text-muted-foreground">
                                                {payment.month && payment.year
                                                  ? `${monthLabels[payment.month - 1]} ${payment.year}`
                                                  : '-'}
                                              </td>
                                              <td className="py-2 px-3 font-medium">
                                                {formatCurrency(Number(payment.amount || 0))}
                                              </td>
                                              <td className="py-2 px-3">
                                                <span
                                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${pConfig.className}`}
                                                >
                                                  {pConfig.label}
                                                </span>
                                              </td>
                                              <td className="py-2 px-3 text-right">
                                                {ACTIONABLE_PAYMENT_STATUSES.includes(
                                                  payment.status
                                                ) && (
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0"
                                                    title="Marcar como pago"
                                                    onClick={() =>
                                                      setSelectedPaymentForAction({
                                                        payment,
                                                        student: invoice.student,
                                                      })
                                                    }
                                                  >
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                  </Button>
                                                )}
                                              </td>
                                            </tr>
                                          )
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {meta && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {invoices.length} de {meta.total} faturas
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setFilters({ page: page - 1 })}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Página {page} de {meta.lastPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.lastPage}
                  onClick={() => setFilters({ page: page + 1 })}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedInvoice && activeModal === 'mark-paid' && (
        <MarkInvoicePaidModal
          invoice={selectedInvoice}
          open
          onOpenChange={(open) => !open && closeModal()}
        />
      )}

      {selectedInvoice && activeModal === 'agreement' && (
        <CreateAgreementModal
          invoice={selectedInvoice}
          open
          onOpenChange={(open) => !open && closeModal()}
        />
      )}

      {selectedPaymentForAction && (
        <MarkPaidModal
          payment={{
            ...selectedPaymentForAction.payment,
            student: selectedPaymentForAction.student,
          }}
          open
          onOpenChange={(open) => {
            if (!open) setSelectedPaymentForAction(null)
          }}
        />
      )}

      {historyInvoiceId && (
        <AuditHistoryModal
          open={!!historyInvoiceId}
          onOpenChange={(open) => {
            if (!open) setHistoryInvoiceId(null)
          }}
          entityType="invoice"
          entityId={historyInvoiceId}
        />
      )}
    </div>
  )
}
