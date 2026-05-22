import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  Users,
  BookOpen,
  Clock,
  Calendar,
  CreditCard,
  AlertTriangle,
  Tag,
  ShoppingBag,
  Megaphone,
  MessageCircle,
  Eye,
  EyeOff,
  GraduationCap,
  LineChart,
  DollarSign,
  Sparkles,
} from 'lucide-react'
import { EscolaLayout } from '../../components/layouts'
import { EscolaLayoutSimplificado } from '../../components/layouts/escola-layout-simplificado'
import { DashboardClassesNav } from '../../components/dashboard/dashboard-classes-nav'
import { AttentionInbox } from '../../containers/dashboard/attention-inbox'
import { FinancialKpiStrip } from '../../containers/dashboard/financial-kpi-strip'
import { EnrollmentConversionStrip } from '../../containers/dashboard/enrollment-conversion-strip'
import { GradeDistributionChart } from '../../containers/grades/grade-distribution-chart'
import { AtRiskStudentsTable } from '../../containers/grades/at-risk-students-table'
import { PedagogicalAttendanceTrendsChartWithFilters } from '../../containers/pedagogical/attendance-trends-chart'
import { GradeTrendsChartWithFilters } from '../../containers/pedagogical/grade-trends-chart'
import { ClassPerformanceChart } from '../../containers/pedagogical/class-performance-chart'
import { EnrollmentTrendsChart } from '../../containers/enrollment-analytics/enrollment-trends-chart'
import { EnrollmentByLevelTable } from '../../containers/enrollment-analytics/enrollment-by-level-table'
import { FinancialRevenueTrendsChart } from '../../containers/financial/financial-revenue-trends-chart'
import { FinancialOverdueAgingChart } from '../../containers/financial/financial-overdue-aging-chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Button } from '../../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { useAuthUser } from '../../stores/auth_store'
import {
  readEscolaDashboardFilters,
  readEscolaDashboardViewMode,
  type EscolaDashboardViewMode,
  writeEscolaDashboardFilters,
  writeEscolaDashboardViewMode,
} from '../../lib/escola-dashboard-view-mode'
import { SubPeriodFilter } from '../../containers/academic-periods/components/sub-period-filter'
import { AskAnuaPanel, AskAnuaSheet } from '../../containers/ai/ask-anua-sheet'
import type { FilterLabels } from '../../lib/contextual-prompts'
import {
  askAnuaThreadKey,
  useDashboardAskAnuaContext,
} from '../../lib/ask-anua-context'
import { api } from '~/lib/api'
import { useIsMobile } from '../../hooks/use_mobile'

function UnreadMessagesBadge() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/v1/escola/inquiries?limit=50', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const unreadCount = (data.data ?? []).filter(
          (i: { hasUnread: boolean }) => i.hasUnread
        ).length
        setCount(unreadCount)
      })
      .catch(() => setCount(0))
  }, [])

  if (!count || count === 0) return null

  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
      {count > 99 ? '99+' : count}
    </span>
  )
}

const HIDE_FINANCIAL_INFO_STORAGE_KEY = 'escola:hide-financial-info'

type DashboardTab = 'pedagogical' | 'administrative' | 'financial'
type TabFilterState = {
  academicPeriodId: string
  courseId: string
  levelId: string
  classId: string
  subPeriodId: string
}

type AcademicPeriodOption = { id: string; name: string }
type AcademicPeriodCourse = {
  courseId: string
  name: string
  levels: Array<{
    id: string
    name: string
    classes: Array<{ id: string; name: string }>
  }>
}

function formatDateLong(date: Date): string {
  const formatted = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function toQueryValue(value: string): string | undefined {
  return value === 'all' ? undefined : value
}

export default function EscolaDashboard() {
  const user = useAuthUser()
  const roleName = user?.role?.name
  const schoolId = user?.school?.id
  const isSchoolTeacher = roleName === 'SCHOOL_TEACHER' || roleName === 'TEACHER'
  const canViewFinancialTab =
    roleName === 'SCHOOL_ADMIN' ||
    roleName === 'SCHOOL_CHAIN_DIRECTOR' ||
    roleName === 'SCHOOL_DIRECTOR'
  const canUseAskAnua = canViewFinancialTab
  const canViewAdministrativeTab = !isSchoolTeacher
  const tabColumnClass = canViewFinancialTab ? 'md:grid-cols-3' : 'md:grid-cols-2'

  const [hideFinancialInfo, setHideFinancialInfo] = useState(true)
  const [viewMode, setViewMode] = useState<EscolaDashboardViewMode>('full')
  const [isViewModeHydrated, setIsViewModeHydrated] = useState(false)
  const [activeTab, setActiveTab] = useState<DashboardTab>('pedagogical')
  const [isAskAnuaOpen, setIsAskAnuaOpen] = useState(false)
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()

  // Prefetch da thread da sheet quando o usuário passa o mouse no botão.
  // Sheet usa sessionStorage[askAnuaThreadKey(...)] como threadId.
  // Quando o user clica, o useQuery em AiChatPane já encontra a resposta
  // cacheada e renderiza direto sem spinner.
  function prefetchAskAnuaThread() {
    if (!schoolId || typeof window === 'undefined') return
    const storedThreadId = window.sessionStorage.getItem(
      askAnuaThreadKey(schoolId, 'escola_dashboard')
    )
    if (!storedThreadId) return
    queryClient.prefetchQuery(
      api.api.v1.ai.threads.show.queryOptions({ params: { id: storedThreadId } })
    )
  }

  const [filters, setFilters] = useState<TabFilterState>({
    academicPeriodId: 'all',
    courseId: 'all',
    levelId: 'all',
    classId: 'all',
    subPeriodId: 'all',
  })
  const [areFiltersHydrated, setAreFiltersHydrated] = useState(false)

  const { data: academicPeriodsData } = useQuery({
    ...api.api.v1.academicPeriods.listAcademicPeriods.queryOptions({ query: { limit: 100 } }),
  })
  const academicPeriods = (academicPeriodsData?.data ?? []) as AcademicPeriodOption[]

  const { data: coursesData } = useQuery({
    ...api.api.v1.academicPeriods.listCourses.queryOptions({
      params: { id: filters.academicPeriodId },
    }),
    enabled: filters.academicPeriodId !== 'all',
  })
  const courses = (coursesData ?? []) as AcademicPeriodCourse[]

  const levels = useMemo(() => {
    if (filters.courseId === 'all') return []
    const selectedCourse = courses.find((course) => course.courseId === filters.courseId)
    if (!selectedCourse) return []
    return selectedCourse.levels.map((level) => ({ id: level.id, name: level.name }))
  }, [courses, filters.courseId])

  const classes = useMemo(() => {
    if (filters.courseId === 'all') return []
    const selectedCourse = courses.find((course) => course.courseId === filters.courseId)
    if (!selectedCourse) return []

    const levelsToUse =
      filters.levelId === 'all'
        ? selectedCourse.levels
        : selectedCourse.levels.filter((level) => level.id === filters.levelId)

    return levelsToUse.flatMap((level) =>
      level.classes.map((cls) => ({ ...cls, levelId: level.id, levelName: level.name }))
    )
  }, [courses, filters.courseId, filters.levelId])

  const selectedPeriodLabel =
    filters.academicPeriodId === 'all'
      ? 'Todos os períodos letivos'
      : (academicPeriods.find((p) => p.id === filters.academicPeriodId)?.name ??
        'Todos os períodos letivos')
  const selectedPeriodName =
    filters.academicPeriodId === 'all'
      ? undefined
      : academicPeriods.find((p) => p.id === filters.academicPeriodId)?.name
  const selectedCourseLabel =
    filters.courseId === 'all'
      ? 'Todos os cursos'
      : (courses.find((c) => c.courseId === filters.courseId)?.name ?? 'Todos os cursos')
  const selectedLevelLabel =
    filters.levelId === 'all'
      ? 'Todos os níveis'
      : (levels.find((l) => l.id === filters.levelId)?.name ?? 'Todos os níveis')
  const selectedClass = classes.find((c) => c.id === filters.classId)
  const selectedClassLabel =
    filters.classId === 'all'
      ? 'Todas as turmas'
      : selectedClass
        ? `${selectedClass.levelName} - ${selectedClass.name}`
        : 'Todas as turmas'

  const askAnuaLabels: FilterLabels = useMemo(() => ({
    academicPeriodName:
      filters.academicPeriodId === 'all'
        ? undefined
        : academicPeriods.find((p) => p.id === filters.academicPeriodId)?.name,
    courseName:
      filters.courseId === 'all'
        ? undefined
        : courses.find((c) => c.courseId === filters.courseId)?.name,
    levelName:
      filters.levelId === 'all'
        ? undefined
        : levels.find((l) => l.id === filters.levelId)?.name,
    className: selectedClass
      ? `${selectedClass.levelName} - ${selectedClass.name}`
      : undefined,
  }), [filters, academicPeriods, courses, levels, selectedClass])

  const askAnuaContext = useDashboardAskAnuaContext(filters, askAnuaLabels)

  useEffect(() => {
    const storedPreference = window.localStorage.getItem(HIDE_FINANCIAL_INFO_STORAGE_KEY)
    if (storedPreference === null) {
      setHideFinancialInfo(true)
      window.localStorage.setItem(HIDE_FINANCIAL_INFO_STORAGE_KEY, 'true')
      return
    }

    setHideFinancialInfo(storedPreference === 'true')
  }, [])

  useEffect(() => {
    if (activeTab === 'financial' && !canViewFinancialTab) {
      setActiveTab('pedagogical')
    }
  }, [activeTab, canViewFinancialTab])

  const toggleFinancialInfoVisibility = () => {
    const nextState = !hideFinancialInfo
    setHideFinancialInfo(nextState)
    window.localStorage.setItem(HIDE_FINANCIAL_INFO_STORAGE_KEY, String(nextState))
  }

  useEffect(() => {
    setViewMode(readEscolaDashboardViewMode(user?.id))
    setIsViewModeHydrated(true)
  }, [user?.id])

  useEffect(() => {
    if (!isViewModeHydrated) return
    writeEscolaDashboardViewMode(user?.id, viewMode)
  }, [isViewModeHydrated, user?.id, viewMode])

  // Hidrata filtros do localStorage no client (SSR não tem window). Bucket
  // único por usuário — academicPeriodId mora dentro do payload.
  useEffect(() => {
    if (!user?.id || areFiltersHydrated) return
    const persisted = readEscolaDashboardFilters(user.id)
    if (persisted) {
      setFilters(persisted)
    }
    setAreFiltersHydrated(true)
  }, [user?.id, areFiltersHydrated])

  useEffect(() => {
    if (!areFiltersHydrated) return
    writeEscolaDashboardFilters(user?.id, filters)
  }, [areFiltersHydrated, user?.id, filters])

  // `as const` aqui é literal-narrowing, não type assertion: sem isso o TS
  // infere `route: string` (widened) e o Link do Inertia exige o union de
  // nomes de rota.
  const quickActions = [
    {
      label: 'Alunos',
      description: 'Matrículas e cadastros',
      route: 'web.escola.administrativo.alunos',
      icon: Users,
      visible: true,
    },
    {
      label: 'Turmas',
      description: 'Turmas e atividades',
      route: 'web.escola.pedagogico.turmas',
      icon: BookOpen,
      visible: true,
    },
    {
      label: 'Horários',
      description: 'Grade de aulas',
      route: 'web.escola.pedagogico.horarios',
      icon: Clock,
      visible: true,
    },
    {
      label: 'Calendário',
      description: 'Eventos e provas',
      route: 'web.escola.pedagogico.calendario',
      icon: Calendar,
      visible: true,
    },
    {
      label: 'Financeiro',
      description: 'Faturas e cobranças',
      route: 'web.escola.financeiro.faturas',
      icon: CreditCard,
      visible: canViewFinancialTab,
    },
    {
      label: 'Inadimplência',
      description: 'Pagamentos em atraso',
      route: 'web.escola.financeiro.inadimplencia',
      icon: AlertTriangle,
      visible: canViewFinancialTab,
    },
    {
      label: 'Bolsas',
      description: 'Descontos e bolsas',
      route: 'web.escola.administrativo.bolsas',
      icon: Tag,
      visible: canViewFinancialTab,
    },
    {
      label: 'Cantina',
      description: 'PDV e cardápio',
      route: 'web.escola.cantina.pdv',
      icon: ShoppingBag,
      visible: true,
    },
    {
      label: 'Comunicados',
      description: 'Enviar avisos',
      route: 'web.escola.comunicados',
      icon: Megaphone,
      visible: true,
    },
    {
      label: 'Chat',
      description: 'Mensagens e dúvidas',
      route: 'web.escola.chat',
      icon: MessageCircle,
      visible: true,
      badge: true,
    },
  ] as const

  const visibleQuickActions = quickActions.filter((action) => action.visible)

  const viewModeToggle = (
    <>
      {canUseAskAnua && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAskAnuaOpen(true)}
          onMouseEnter={prefetchAskAnuaThread}
          onFocus={prefetchAskAnuaThread}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Perguntar ao Anuá</span>
          <span className="sr-only sm:hidden">Perguntar ao Anuá</span>
        </Button>
      )}
      <Button
        type="button"
        variant={viewMode === 'full' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('full')}
      >
        Visão completa
      </Button>
      <Button
        type="button"
        variant={viewMode === 'simple' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('simple')}
      >
        Visão simplificada
      </Button>
    </>
  )

  // Sheet (overlay) é o caminho mobile do full view e o caminho padrão
  // do simple view (independente de breakpoint). Em desktop full view ele
  // dá lugar ao painel inline.
  const askAnuaSheet = canUseAskAnua ? (
    <AskAnuaSheet
      open={isAskAnuaOpen}
      onOpenChange={setIsAskAnuaOpen}
      {...askAnuaContext}
    />
  ) : null

  const askAnuaInline =
    canUseAskAnua && !isMobile && isAskAnuaOpen ? (
      <AskAnuaPanel
        {...askAnuaContext}
        onClose={() => setIsAskAnuaOpen(false)}
      />
    ) : null

  if (viewMode === 'simple') {
    return (
      <EscolaLayoutSimplificado
        title="Dashboard"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      >
        <Head title="Dashboard" />

        <section className="mx-auto max-w-3xl space-y-8 py-4 sm:py-8">
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Olá{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">O que voce precisa fazer agora?</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {visibleQuickActions.map((action) => (
              <Link
                key={action.label}
                route={action.route}
                className="group relative flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-center transition-colors hover:border-primary/30 hover:bg-muted/50 sm:p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
                {'badge' in action && action.badge && (
                  <span className="absolute -right-1 -top-1">
                    <UnreadMessagesBadge />
                  </span>
                )}
              </Link>
            ))}
          </div>

          <DashboardClassesNav />
        </section>

        {askAnuaSheet}
      </EscolaLayoutSimplificado>
    )
  }

  const filterBar = (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={filters.academicPeriodId}
        onValueChange={(value) => {
          if (!value) return
          setFilters({
            academicPeriodId: value,
            courseId: 'all',
            levelId: 'all',
            classId: 'all',
            subPeriodId: 'all',
          })
        }}
      >
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="Período letivo">{selectedPeriodLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os períodos letivos</SelectItem>
          {academicPeriods.map((period) => (
            <SelectItem key={period.id} value={period.id}>
              {period.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {filters.academicPeriodId !== 'all' && (
        <SubPeriodFilter
          academicPeriodId={filters.academicPeriodId}
          value={filters.subPeriodId}
          onChange={(value) => setFilters((prev) => ({ ...prev, subPeriodId: value }))}
        />
      )}

      <Select
        value={filters.courseId}
        onValueChange={(value) => {
          if (!value) return
          setFilters((prev) => ({ ...prev, courseId: value, levelId: 'all', classId: 'all' }))
        }}
        disabled={filters.academicPeriodId === 'all'}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Curso">{selectedCourseLabel}</SelectValue>
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
        value={filters.levelId}
        onValueChange={(value) => {
          if (!value) return
          setFilters((prev) => ({ ...prev, levelId: value, classId: 'all' }))
        }}
        disabled={filters.courseId === 'all'}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Nível">{selectedLevelLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os níveis</SelectItem>
          {levels.map((level) => (
            <SelectItem key={level.id} value={level.id}>
              {level.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.classId}
        onValueChange={(value) => {
          if (!value) return
          setFilters((prev) => ({ ...prev, classId: value }))
        }}
        disabled={filters.courseId === 'all'}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Turma">{selectedClassLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as turmas</SelectItem>
          {classes.map((cls) => (
            <SelectItem key={cls.id} value={cls.id}>
              {cls.levelName} - {cls.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <EscolaLayout topbarActions={viewModeToggle} rightPane={askAnuaInline}>
      <Head title="Dashboard" />

      <div className="space-y-6">
        {isSchoolTeacher ? (
          <>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight">Visão geral</h1>
              <p className="text-sm text-muted-foreground">
                {formatDateLong(new Date())}
                {user?.school?.name ? ` · ${user.school.name}` : ''}
              </p>
            </div>

            {filterBar}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <aside className="lg:order-2 lg:sticky lg:top-6 lg:self-start">
                <AttentionInbox
                  academicPeriodId={toQueryValue(filters.academicPeriodId)}
                  courseId={toQueryValue(filters.courseId)}
                  levelId={toQueryValue(filters.levelId)}
                  classId={toQueryValue(filters.classId)}
                  subPeriodId={toQueryValue(filters.subPeriodId)}
                  showFinancial={false}
                  showEnrollment={false}
                />
              </aside>

              <div className="min-w-0 space-y-6 lg:order-1">
                <div className="grid gap-4 md:grid-cols-2">
                  <GradeDistributionChart
                    academicPeriodId={toQueryValue(filters.academicPeriodId)}
                    classId={toQueryValue(filters.classId)}
                    subPeriodId={toQueryValue(filters.subPeriodId)}
                  />
                  <PedagogicalAttendanceTrendsChartWithFilters
                    academicPeriodId={toQueryValue(filters.academicPeriodId)}
                    courseId={toQueryValue(filters.courseId)}
                    classId={toQueryValue(filters.classId)}
                  />
                  <GradeTrendsChartWithFilters
                    academicPeriodId={toQueryValue(filters.academicPeriodId)}
                    classId={toQueryValue(filters.classId)}
                  />
                  <ClassPerformanceChart
                    defaultAcademicPeriodFilter={selectedPeriodName}
                    defaultClassFilter={toQueryValue(filters.classId)}
                  />
                </div>

                <AtRiskStudentsTable
                  academicPeriodId={toQueryValue(filters.academicPeriodId)}
                  classId={toQueryValue(filters.classId)}
                  subPeriodId={toQueryValue(filters.subPeriodId)}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight">Visão geral</h1>
              <p className="text-sm text-muted-foreground">
                {formatDateLong(new Date())}
                {user?.school?.name ? ` · ${user.school.name}` : ''}
              </p>
            </div>

            {filterBar}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <aside className="lg:order-2 lg:sticky lg:top-6 lg:self-start">
                <AttentionInbox
                  academicPeriodId={toQueryValue(filters.academicPeriodId)}
                  courseId={toQueryValue(filters.courseId)}
                  levelId={toQueryValue(filters.levelId)}
                  classId={toQueryValue(filters.classId)}
                  subPeriodId={toQueryValue(filters.subPeriodId)}
                  showFinancial={canViewFinancialTab}
                  showEnrollment={canViewFinancialTab}
                />
              </aside>

              <div className="min-w-0 lg:order-1">
                <Tabs
                  value={activeTab}
                  onValueChange={(value: string) => setActiveTab(value as DashboardTab)}
                >
                  <TabsList className={`grid w-full md:w-auto md:inline-grid ${tabColumnClass}`}>
                    <TabsTrigger value="pedagogical" className="gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Pedagógico
                    </TabsTrigger>

                    {canViewAdministrativeTab && (
                      <TabsTrigger value="administrative" className="gap-2">
                        <LineChart className="h-4 w-4" />
                        Administrativo
                      </TabsTrigger>
                    )}

                    {canViewFinancialTab && (
                      <TabsTrigger value="financial" className="gap-2">
                        <DollarSign className="h-4 w-4" />
                        Financeiro
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="pedagogical" className="mt-6 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <GradeDistributionChart
                        academicPeriodId={toQueryValue(filters.academicPeriodId)}
                        classId={toQueryValue(filters.classId)}
                      />
                      <PedagogicalAttendanceTrendsChartWithFilters
                        academicPeriodId={toQueryValue(filters.academicPeriodId)}
                        courseId={toQueryValue(filters.courseId)}
                        classId={toQueryValue(filters.classId)}
                      />
                      <GradeTrendsChartWithFilters
                        academicPeriodId={toQueryValue(filters.academicPeriodId)}
                        classId={toQueryValue(filters.classId)}
                      />
                      <ClassPerformanceChart
                        defaultAcademicPeriodFilter={selectedPeriodName}
                        defaultClassFilter={toQueryValue(filters.classId)}
                      />
                    </div>

                    <AtRiskStudentsTable
                      academicPeriodId={toQueryValue(filters.academicPeriodId)}
                      classId={toQueryValue(filters.classId)}
                    />
                  </TabsContent>

                  {canViewAdministrativeTab && (
                    <TabsContent value="administrative" className="mt-6 space-y-6">
                      <EnrollmentConversionStrip
                        schoolId={schoolId}
                        academicPeriodId={toQueryValue(filters.academicPeriodId)}
                        courseId={toQueryValue(filters.courseId)}
                        levelId={toQueryValue(filters.levelId)}
                        classId={toQueryValue(filters.classId)}
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <EnrollmentTrendsChart
                          schoolId={schoolId}
                          academicPeriodId={toQueryValue(filters.academicPeriodId)}
                          courseId={toQueryValue(filters.courseId)}
                          levelId={toQueryValue(filters.levelId)}
                          classId={toQueryValue(filters.classId)}
                          days={30}
                        />
                        <EnrollmentByLevelTable
                          schoolId={schoolId}
                          academicPeriodId={toQueryValue(filters.academicPeriodId)}
                          courseId={toQueryValue(filters.courseId)}
                          levelId={toQueryValue(filters.levelId)}
                          classId={toQueryValue(filters.classId)}
                        />
                      </div>
                    </TabsContent>
                  )}

                  {canViewFinancialTab && (
                    <TabsContent value="financial" className="mt-6 space-y-6">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={toggleFinancialInfoVisibility}
                          className="gap-2"
                        >
                          {hideFinancialInfo ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                          {hideFinancialInfo ? 'Mostrar valores' : 'Ocultar valores'}
                        </Button>
                      </div>

                      <FinancialKpiStrip
                        hideFinancialValues={hideFinancialInfo}
                        academicPeriodId={toQueryValue(filters.academicPeriodId)}
                        courseId={toQueryValue(filters.courseId)}
                        levelId={toQueryValue(filters.levelId)}
                        classId={toQueryValue(filters.classId)}
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <FinancialRevenueTrendsChart
                          hideFinancialValues={hideFinancialInfo}
                          academicPeriodId={toQueryValue(filters.academicPeriodId)}
                          courseId={toQueryValue(filters.courseId)}
                          levelId={toQueryValue(filters.levelId)}
                          classId={toQueryValue(filters.classId)}
                        />

                        <FinancialOverdueAgingChart
                          hideFinancialValues={hideFinancialInfo}
                          academicPeriodId={toQueryValue(filters.academicPeriodId)}
                          courseId={toQueryValue(filters.courseId)}
                          levelId={toQueryValue(filters.levelId)}
                          classId={toQueryValue(filters.classId)}
                        />
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </div>
          </>
        )}
      </div>

      {/* No full view, o Sheet só monta em mobile — desktop usa o rightPane inline */}
      {isMobile ? askAnuaSheet : null}
    </EscolaLayout>
  )
}
