import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { GraduationCap, LineChart, DollarSign, Eye, EyeOff } from 'lucide-react'
import { EscolaLayout } from '../../components/layouts'
import { EscolaLayoutSimplificado } from '../../components/layouts/escola-layout-simplificado'
import { DashboardClassesNav } from '../../components/dashboard/dashboard-classes-nav'
import { EscolaStatsContainer } from '../../containers/escola-stats-container'
import { EscolaInsightsContainer } from '../../containers/escola-insights-container'
import { PedagogicalAlertsCards } from '../../containers/dashboard/pedagogical-alerts-cards'
import { AcademicOverviewCards } from '../../containers/grades/academic-overview-cards'
import { GradeDistributionChart } from '../../containers/grades/grade-distribution-chart'
import { AtRiskStudentsTable } from '../../containers/grades/at-risk-students-table'
import { PedagogicalAttendanceTrendsChartWithFilters } from '../../containers/pedagogical/attendance-trends-chart'
import { GradeTrendsChartWithFilters } from '../../containers/pedagogical/grade-trends-chart'
import { ClassPerformanceChart } from '../../containers/pedagogical/class-performance-chart'
import { EnrollmentFunnelStats } from '../../containers/enrollment-analytics/enrollment-funnel-stats'
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
  readEscolaDashboardViewMode,
  type EscolaDashboardViewMode,
  writeEscolaDashboardViewMode,
} from '../../lib/escola-dashboard-view-mode'
import { api } from '~/lib/api'

const HIDE_FINANCIAL_INFO_STORAGE_KEY = 'escola:hide-financial-info'

type DashboardTab = 'pedagogical' | 'administrative' | 'financial'
type TabFilterState = {
  academicPeriodId: string
  courseId: string
  levelId: string
  classId: string
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

export default function EscolaDashboard() {
  const user = useAuthUser()
  const roleName = user?.role?.name
  const schoolId = user?.school?.id
  const isSchoolTeacher = roleName === 'SCHOOL_TEACHER' || roleName === 'TEACHER'
  const canViewFinancialTab =
    roleName === 'SCHOOL_ADMIN' ||
    roleName === 'SCHOOL_CHAIN_DIRECTOR' ||
    roleName === 'SCHOOL_DIRECTOR'
  const canViewAdministrativeTab = !isSchoolTeacher
  const tabColumnClass = canViewFinancialTab ? 'md:grid-cols-3' : 'md:grid-cols-2'
  const [hideFinancialInfo, setHideFinancialInfo] = useState(true)
  const [viewMode, setViewMode] = useState<EscolaDashboardViewMode>('full')
  const [isViewModeHydrated, setIsViewModeHydrated] = useState(false)
  const [activeTab, setActiveTab] = useState<DashboardTab>('pedagogical')
  const [pedagogicalFilters, setPedagogicalFilters] = useState<TabFilterState>({
    academicPeriodId: 'all',
    courseId: 'all',
    levelId: 'all',
    classId: 'all',
  })
  const [administrativeFilters, setAdministrativeFilters] = useState<TabFilterState>({
    academicPeriodId: 'all',
    courseId: 'all',
    levelId: 'all',
    classId: 'all',
  })
  const [financialFilters, setFinancialFilters] = useState<TabFilterState>({
    academicPeriodId: 'all',
    courseId: 'all',
    levelId: 'all',
    classId: 'all',
  })

  const { data: academicPeriodsData } = useQuery({
    ...api.api.v1.academicPeriods.listAcademicPeriods.queryOptions({ query: { limit: 100 } }),
  })
  const academicPeriods = (academicPeriodsData?.data ?? []) as AcademicPeriodOption[]

  const { data: pedagogicalCoursesData } = useQuery({
    ...api.api.v1.academicPeriods.listCourses.queryOptions({
      params: { id: pedagogicalFilters.academicPeriodId },
    }),
    enabled: pedagogicalFilters.academicPeriodId !== 'all',
  })
  const pedagogicalCourses = (pedagogicalCoursesData ?? []) as AcademicPeriodCourse[]
  const pedagogicalLevels = useMemo(() => {
    if (pedagogicalFilters.courseId === 'all') return []
    const selectedCourse = pedagogicalCourses.find(
      (course) => course.courseId === pedagogicalFilters.courseId
    )
    if (!selectedCourse) return []
    return selectedCourse.levels.map((level) => ({ id: level.id, name: level.name }))
  }, [pedagogicalCourses, pedagogicalFilters.courseId])
  const pedagogicalClasses = useMemo(() => {
    if (pedagogicalFilters.courseId === 'all') return []
    const selectedCourse = pedagogicalCourses.find(
      (course) => course.courseId === pedagogicalFilters.courseId
    )
    if (!selectedCourse) return []

    const levelsToUse =
      pedagogicalFilters.levelId === 'all'
        ? selectedCourse.levels
        : selectedCourse.levels.filter((level) => level.id === pedagogicalFilters.levelId)

    return levelsToUse.flatMap((level) =>
      level.classes.map((cls) => ({ ...cls, levelId: level.id, levelName: level.name }))
    )
  }, [pedagogicalCourses, pedagogicalFilters.courseId, pedagogicalFilters.levelId])

  const { data: administrativeCoursesData } = useQuery({
    ...api.api.v1.academicPeriods.listCourses.queryOptions({
      params: { id: administrativeFilters.academicPeriodId },
    }),
    enabled: administrativeFilters.academicPeriodId !== 'all',
  })
  const administrativeCourses = (administrativeCoursesData ?? []) as AcademicPeriodCourse[]
  const administrativeLevels = useMemo(() => {
    if (administrativeFilters.courseId === 'all') return []
    const selectedCourse = administrativeCourses.find(
      (course) => course.courseId === administrativeFilters.courseId
    )
    if (!selectedCourse) return []
    return selectedCourse.levels.map((level) => ({ id: level.id, name: level.name }))
  }, [administrativeCourses, administrativeFilters.courseId])
  const administrativeClasses = useMemo(() => {
    if (administrativeFilters.courseId === 'all') return []
    const selectedCourse = administrativeCourses.find(
      (course) => course.courseId === administrativeFilters.courseId
    )
    if (!selectedCourse) return []

    const levelsToUse =
      administrativeFilters.levelId === 'all'
        ? selectedCourse.levels
        : selectedCourse.levels.filter((level) => level.id === administrativeFilters.levelId)

    return levelsToUse.flatMap((level) =>
      level.classes.map((cls) => ({ ...cls, levelId: level.id, levelName: level.name }))
    )
  }, [administrativeCourses, administrativeFilters.courseId, administrativeFilters.levelId])

  const { data: financialCoursesData } = useQuery({
    ...api.api.v1.academicPeriods.listCourses.queryOptions({
      params: { id: financialFilters.academicPeriodId },
    }),
    enabled: financialFilters.academicPeriodId !== 'all',
  })
  const financialCourses = (financialCoursesData ?? []) as AcademicPeriodCourse[]
  const financialLevels = useMemo(() => {
    if (financialFilters.courseId === 'all') return []
    const selectedCourse = financialCourses.find(
      (course) => course.courseId === financialFilters.courseId
    )
    if (!selectedCourse) return []
    return selectedCourse.levels.map((level) => ({ id: level.id, name: level.name }))
  }, [financialCourses, financialFilters.courseId])
  const financialClasses = useMemo(() => {
    if (financialFilters.courseId === 'all') return []
    const selectedCourse = financialCourses.find(
      (course) => course.courseId === financialFilters.courseId
    )
    if (!selectedCourse) return []

    const levelsToUse =
      financialFilters.levelId === 'all'
        ? selectedCourse.levels
        : selectedCourse.levels.filter((level) => level.id === financialFilters.levelId)

    return levelsToUse.flatMap((level) =>
      level.classes.map((cls) => ({ ...cls, levelId: level.id, levelName: level.name }))
    )
  }, [financialCourses, financialFilters.courseId, financialFilters.levelId])

  const selectedPedagogicalPeriodLabel =
    pedagogicalFilters.academicPeriodId === 'all'
      ? 'Todos os períodos letivos'
      : (academicPeriods.find((p) => p.id === pedagogicalFilters.academicPeriodId)?.name ??
        'Todos os períodos letivos')
  const selectedPedagogicalPeriodName =
    pedagogicalFilters.academicPeriodId === 'all'
      ? undefined
      : academicPeriods.find((p) => p.id === pedagogicalFilters.academicPeriodId)?.name
  const selectedPedagogicalCourseLabel =
    pedagogicalFilters.courseId === 'all'
      ? 'Todos os cursos'
      : (pedagogicalCourses.find((c) => c.courseId === pedagogicalFilters.courseId)?.name ??
        'Todos os cursos')
  const selectedPedagogicalClass = pedagogicalClasses.find(
    (c) => c.id === pedagogicalFilters.classId
  )
  const selectedPedagogicalClassLabel =
    pedagogicalFilters.classId === 'all'
      ? 'Todas as turmas'
      : selectedPedagogicalClass
        ? `${selectedPedagogicalClass.levelName} - ${selectedPedagogicalClass.name}`
        : 'Todas as turmas'
  const selectedPedagogicalLevelLabel =
    pedagogicalFilters.levelId === 'all'
      ? 'Todos os níveis'
      : (pedagogicalLevels.find((l) => l.id === pedagogicalFilters.levelId)?.name ??
        'Todos os níveis')

  const selectedAdministrativeLevelLabel =
    administrativeFilters.levelId === 'all'
      ? 'Todos os níveis'
      : (administrativeLevels.find((l) => l.id === administrativeFilters.levelId)?.name ??
        'Todos os níveis')

  const selectedAdministrativeClass = administrativeClasses.find(
    (c) => c.id === administrativeFilters.classId
  )
  const selectedAdministrativeClassLabel =
    administrativeFilters.classId === 'all'
      ? 'Todas as turmas'
      : selectedAdministrativeClass
        ? `${selectedAdministrativeClass.levelName} - ${selectedAdministrativeClass.name}`
        : 'Todas as turmas'

  const selectedAdministrativePeriodLabel =
    administrativeFilters.academicPeriodId === 'all'
      ? 'Todos os períodos letivos'
      : (academicPeriods.find((p) => p.id === administrativeFilters.academicPeriodId)?.name ??
        'Todos os períodos letivos')
  const selectedAdministrativeCourseLabel =
    administrativeFilters.courseId === 'all'
      ? 'Todos os cursos'
      : (administrativeCourses.find((c) => c.courseId === administrativeFilters.courseId)?.name ??
        'Todos os cursos')

  const selectedFinancialPeriodLabel =
    financialFilters.academicPeriodId === 'all'
      ? 'Todos os períodos letivos'
      : (academicPeriods.find((p) => p.id === financialFilters.academicPeriodId)?.name ??
        'Todos os períodos letivos')
  const selectedFinancialCourseLabel =
    financialFilters.courseId === 'all'
      ? 'Todos os cursos'
      : (financialCourses.find((c) => c.courseId === financialFilters.courseId)?.name ??
        'Todos os cursos')
  const selectedFinancialLevelLabel =
    financialFilters.levelId === 'all'
      ? 'Todos os níveis'
      : (financialLevels.find((l) => l.id === financialFilters.levelId)?.name ?? 'Todos os níveis')
  const selectedFinancialClass = financialClasses.find((c) => c.id === financialFilters.classId)
  const selectedFinancialClassLabel =
    financialFilters.classId === 'all'
      ? 'Todas as turmas'
      : selectedFinancialClass
        ? `${selectedFinancialClass.levelName} - ${selectedFinancialClass.name}`
        : 'Todas as turmas'

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

  const quickActions = [
    { label: 'Alunos', href: '/escola/administrativo/alunos', visible: true },
    { label: 'Turmas', href: '/escola/pedagogico/turmas', visible: true },
    { label: 'Calendário', href: '/escola/pedagogico/calendario', visible: true },
    { label: 'Financeiro', href: '/escola/financeiro/faturas', visible: canViewFinancialTab },
    { label: 'Cantina', href: '/escola/cantina/pdv', visible: true },
    { label: 'Comunicados', href: '/escola/comunicados', visible: true },
  ].filter((action) => action.visible)

  const viewModeToggle = (
    <>
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

  if (viewMode === 'simple') {
    return (
      <EscolaLayoutSimplificado
        title="Dashboard"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      >
        <Head title="Dashboard" />

        <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 py-2 sm:py-6">
          <h1 className="text-center text-2xl font-semibold">O que você quer fazer agora?</h1>

          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="rounded-xl border bg-card px-6 py-5 text-lg font-medium transition-colors hover:bg-muted"
              >
                {action.label}
              </Link>
            ))}
          </div>

          <DashboardClassesNav />
        </section>
      </EscolaLayoutSimplificado>
    )
  }

  return (
    <EscolaLayout topbarActions={viewModeToggle}>
      <Head title="Dashboard" />

      <div className="space-y-6">
        {/* Welcome section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Olá, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">
              Bem-vindo ao painel da {user?.school?.name || 'escola'}
            </p>
          </div>
        </div>

        {isSchoolTeacher ? (
          <>
            <div className="flex flex-wrap items-center justify-start gap-2">
              <Select
                value={pedagogicalFilters.academicPeriodId}
                onValueChange={(value) => {
                  if (!value) return
                  setPedagogicalFilters({
                    academicPeriodId: value,
                    courseId: 'all',
                    levelId: 'all',
                    classId: 'all',
                  })
                }}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Período letivo">
                    {selectedPedagogicalPeriodLabel}
                  </SelectValue>
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

              <Select
                value={pedagogicalFilters.courseId}
                onValueChange={(value) => {
                  if (!value) return
                  setPedagogicalFilters((prev) => ({
                    ...prev,
                    courseId: value,
                    levelId: 'all',
                    classId: 'all',
                  }))
                }}
                disabled={pedagogicalFilters.academicPeriodId === 'all'}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Curso">{selectedPedagogicalCourseLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os cursos</SelectItem>
                  {pedagogicalCourses.map((course) => (
                    <SelectItem key={course.courseId} value={course.courseId}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={pedagogicalFilters.levelId}
                onValueChange={(value) => {
                  if (!value) return
                  setPedagogicalFilters((prev) => ({ ...prev, levelId: value, classId: 'all' }))
                }}
                disabled={pedagogicalFilters.courseId === 'all'}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Nível">{selectedPedagogicalLevelLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  {pedagogicalLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={pedagogicalFilters.classId}
                onValueChange={(value) => {
                  if (!value) return
                  setPedagogicalFilters((prev) => ({ ...prev, classId: value }))
                }}
                disabled={pedagogicalFilters.courseId === 'all'}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Turma">{selectedPedagogicalClassLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  {pedagogicalClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.levelName} - {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <PedagogicalAlertsCards
              academicPeriodId={
                pedagogicalFilters.academicPeriodId === 'all'
                  ? undefined
                  : pedagogicalFilters.academicPeriodId
              }
              courseId={
                pedagogicalFilters.courseId === 'all' ? undefined : pedagogicalFilters.courseId
              }
              levelId={
                pedagogicalFilters.levelId === 'all' ? undefined : pedagogicalFilters.levelId
              }
              classId={
                pedagogicalFilters.classId === 'all' ? undefined : pedagogicalFilters.classId
              }
            />
            <AcademicOverviewCards
              academicPeriodId={
                pedagogicalFilters.academicPeriodId === 'all'
                  ? undefined
                  : pedagogicalFilters.academicPeriodId
              }
              classId={
                pedagogicalFilters.classId === 'all' ? undefined : pedagogicalFilters.classId
              }
            />

            <div className="grid gap-4 md:grid-cols-2">
              <GradeDistributionChart
                academicPeriodId={
                  pedagogicalFilters.academicPeriodId === 'all'
                    ? undefined
                    : pedagogicalFilters.academicPeriodId
                }
                classId={
                  pedagogicalFilters.classId === 'all' ? undefined : pedagogicalFilters.classId
                }
              />
              <PedagogicalAttendanceTrendsChartWithFilters
                academicPeriodId={
                  pedagogicalFilters.academicPeriodId === 'all'
                    ? undefined
                    : pedagogicalFilters.academicPeriodId
                }
                courseId={
                  pedagogicalFilters.courseId === 'all' ? undefined : pedagogicalFilters.courseId
                }
                classId={
                  pedagogicalFilters.classId === 'all' ? undefined : pedagogicalFilters.classId
                }
              />
              <GradeTrendsChartWithFilters
                academicPeriodId={
                  pedagogicalFilters.academicPeriodId === 'all'
                    ? undefined
                    : pedagogicalFilters.academicPeriodId
                }
                classId={
                  pedagogicalFilters.classId === 'all' ? undefined : pedagogicalFilters.classId
                }
              />
              <ClassPerformanceChart
                defaultAcademicPeriodFilter={selectedPedagogicalPeriodName}
                defaultClassFilter={
                  pedagogicalFilters.classId === 'all' ? undefined : pedagogicalFilters.classId
                }
              />
            </div>

            <AtRiskStudentsTable
              academicPeriodId={
                pedagogicalFilters.academicPeriodId === 'all'
                  ? undefined
                  : pedagogicalFilters.academicPeriodId
              }
              classId={
                pedagogicalFilters.classId === 'all' ? undefined : pedagogicalFilters.classId
              }
            />

            <EscolaInsightsContainer allowedTypes={['academic']} />
          </>
        ) : (
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
              <div className="flex flex-wrap items-center justify-start gap-2">
                <Select
                  value={pedagogicalFilters.academicPeriodId}
                  onValueChange={(value) => {
                    if (!value) return
                    setPedagogicalFilters({
                      academicPeriodId: value,
                      courseId: 'all',
                      levelId: 'all',
                      classId: 'all',
                    })
                  }}
                >
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Período letivo">
                      {selectedPedagogicalPeriodLabel}
                    </SelectValue>
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

                <Select
                  value={pedagogicalFilters.courseId}
                  onValueChange={(value) => {
                    if (!value) return
                    setPedagogicalFilters((prev) => ({
                      ...prev,
                      courseId: value,
                      levelId: 'all',
                      classId: 'all',
                    }))
                  }}
                  disabled={pedagogicalFilters.academicPeriodId === 'all'}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Curso">{selectedPedagogicalCourseLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os cursos</SelectItem>
                    {pedagogicalCourses.map((course) => (
                      <SelectItem key={course.courseId} value={course.courseId}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={pedagogicalFilters.levelId}
                  onValueChange={(value) => {
                    if (!value) return
                    setPedagogicalFilters((prev) => ({ ...prev, levelId: value, classId: 'all' }))
                  }}
                  disabled={pedagogicalFilters.courseId === 'all'}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Nível">{selectedPedagogicalLevelLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os níveis</SelectItem>
                    {pedagogicalLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={pedagogicalFilters.classId}
                  onValueChange={(value) => {
                    if (!value) return
                    setPedagogicalFilters((prev) => ({ ...prev, classId: value }))
                  }}
                  disabled={pedagogicalFilters.courseId === 'all'}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Turma">{selectedPedagogicalClassLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as turmas</SelectItem>
                    {pedagogicalClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.levelName} - {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <PedagogicalAlertsCards
                academicPeriodId={
                  pedagogicalFilters.academicPeriodId === 'all'
                    ? undefined
                    : pedagogicalFilters.academicPeriodId
                }
                courseId={
                  pedagogicalFilters.courseId === 'all' ? undefined : pedagogicalFilters.courseId
                }
                levelId={
                  pedagogicalFilters.levelId === 'all' ? undefined : pedagogicalFilters.levelId
                }
                classId={
                  pedagogicalFilters.classId === 'all' ? undefined : pedagogicalFilters.classId
                }
              />
              <AcademicOverviewCards
                academicPeriodId={
                  pedagogicalFilters.academicPeriodId === 'all'
                    ? undefined
                    : pedagogicalFilters.academicPeriodId
                }
                classId={
                  pedagogicalFilters.classId === 'all' ? undefined : pedagogicalFilters.classId
                }
              />

              <div className="grid gap-4 md:grid-cols-2">
                <GradeDistributionChart
                  academicPeriodId={
                    pedagogicalFilters.academicPeriodId === 'all'
                      ? undefined
                      : pedagogicalFilters.academicPeriodId
                  }
                  classId={
                    pedagogicalFilters.classId === 'all' ? undefined : pedagogicalFilters.classId
                  }
                />
                <PedagogicalAttendanceTrendsChartWithFilters
                  academicPeriodId={
                    pedagogicalFilters.academicPeriodId === 'all'
                      ? undefined
                      : pedagogicalFilters.academicPeriodId
                  }
                  courseId={
                    pedagogicalFilters.courseId === 'all' ? undefined : pedagogicalFilters.courseId
                  }
                  classId={
                    pedagogicalFilters.classId === 'all' ? undefined : pedagogicalFilters.classId
                  }
                />
                <GradeTrendsChartWithFilters
                  academicPeriodId={
                    pedagogicalFilters.academicPeriodId === 'all'
                      ? undefined
                      : pedagogicalFilters.academicPeriodId
                  }
                  classId={
                    pedagogicalFilters.classId === 'all' ? undefined : pedagogicalFilters.classId
                  }
                />
                <ClassPerformanceChart
                  defaultAcademicPeriodFilter={selectedPedagogicalPeriodName}
                  defaultClassFilter={
                    pedagogicalFilters.classId === 'all' ? undefined : pedagogicalFilters.classId
                  }
                />
              </div>

              <AtRiskStudentsTable
                academicPeriodId={
                  pedagogicalFilters.academicPeriodId === 'all'
                    ? undefined
                    : pedagogicalFilters.academicPeriodId
                }
                classId={
                  pedagogicalFilters.classId === 'all' ? undefined : pedagogicalFilters.classId
                }
              />

              <EscolaInsightsContainer allowedTypes={['academic']} />
            </TabsContent>

            {canViewAdministrativeTab && (
              <TabsContent value="administrative" className="mt-6 space-y-6">
                <div className="flex flex-wrap items-center justify-start gap-2">
                  <Select
                    value={administrativeFilters.academicPeriodId}
                    onValueChange={(value) => {
                      if (!value) return
                      setAdministrativeFilters({
                        academicPeriodId: value,
                        courseId: 'all',
                        levelId: 'all',
                        classId: 'all',
                      })
                    }}
                  >
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Período letivo">
                        {selectedAdministrativePeriodLabel}
                      </SelectValue>
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

                  <Select
                    value={administrativeFilters.courseId}
                    onValueChange={(value) => {
                      if (!value) return
                      setAdministrativeFilters((prev) => ({
                        ...prev,
                        courseId: value,
                        levelId: 'all',
                        classId: 'all',
                      }))
                    }}
                    disabled={administrativeFilters.academicPeriodId === 'all'}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Curso">
                        {selectedAdministrativeCourseLabel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os cursos</SelectItem>
                      {administrativeCourses.map((course) => (
                        <SelectItem key={course.courseId} value={course.courseId}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={administrativeFilters.levelId}
                    onValueChange={(value) => {
                      if (!value) return
                      setAdministrativeFilters((prev) => ({
                        ...prev,
                        levelId: value,
                        classId: 'all',
                      }))
                    }}
                    disabled={administrativeFilters.courseId === 'all'}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Nível">
                        {selectedAdministrativeLevelLabel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os níveis</SelectItem>
                      {administrativeLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={administrativeFilters.classId}
                    onValueChange={(value) => {
                      if (!value) return
                      setAdministrativeFilters((prev) => ({ ...prev, classId: value }))
                    }}
                    disabled={administrativeFilters.courseId === 'all'}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Turma">
                        {selectedAdministrativeClassLabel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as turmas</SelectItem>
                      {administrativeClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.levelName} - {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <EscolaInsightsContainer
                  allowedTypes={['enrollment']}
                  academicPeriodId={
                    administrativeFilters.academicPeriodId === 'all'
                      ? undefined
                      : administrativeFilters.academicPeriodId
                  }
                  courseId={
                    administrativeFilters.courseId === 'all'
                      ? undefined
                      : administrativeFilters.courseId
                  }
                  levelId={
                    administrativeFilters.levelId === 'all'
                      ? undefined
                      : administrativeFilters.levelId
                  }
                  classId={
                    administrativeFilters.classId === 'all'
                      ? undefined
                      : administrativeFilters.classId
                  }
                />

                <EnrollmentFunnelStats
                  schoolId={schoolId}
                  academicPeriodId={
                    administrativeFilters.academicPeriodId === 'all'
                      ? undefined
                      : administrativeFilters.academicPeriodId
                  }
                  courseId={
                    administrativeFilters.courseId === 'all'
                      ? undefined
                      : administrativeFilters.courseId
                  }
                  levelId={
                    administrativeFilters.levelId === 'all'
                      ? undefined
                      : administrativeFilters.levelId
                  }
                  classId={
                    administrativeFilters.classId === 'all'
                      ? undefined
                      : administrativeFilters.classId
                  }
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <EnrollmentTrendsChart
                    schoolId={schoolId}
                    academicPeriodId={
                      administrativeFilters.academicPeriodId === 'all'
                        ? undefined
                        : administrativeFilters.academicPeriodId
                    }
                    courseId={
                      administrativeFilters.courseId === 'all'
                        ? undefined
                        : administrativeFilters.courseId
                    }
                    levelId={
                      administrativeFilters.levelId === 'all'
                        ? undefined
                        : administrativeFilters.levelId
                    }
                    classId={
                      administrativeFilters.classId === 'all'
                        ? undefined
                        : administrativeFilters.classId
                    }
                    days={30}
                  />
                  <EnrollmentByLevelTable
                    schoolId={schoolId}
                    academicPeriodId={
                      administrativeFilters.academicPeriodId === 'all'
                        ? undefined
                        : administrativeFilters.academicPeriodId
                    }
                    courseId={
                      administrativeFilters.courseId === 'all'
                        ? undefined
                        : administrativeFilters.courseId
                    }
                    levelId={
                      administrativeFilters.levelId === 'all'
                        ? undefined
                        : administrativeFilters.levelId
                    }
                    classId={
                      administrativeFilters.classId === 'all'
                        ? undefined
                        : administrativeFilters.classId
                    }
                  />
                </div>
              </TabsContent>
            )}

            {canViewFinancialTab && (
              <TabsContent value="financial" className="mt-6 space-y-6">
                <div className="flex flex-wrap items-center justify-start gap-2">
                  <Select
                    value={financialFilters.academicPeriodId}
                    onValueChange={(value) => {
                      if (!value) return
                      setFinancialFilters({
                        academicPeriodId: value,
                        courseId: 'all',
                        levelId: 'all',
                        classId: 'all',
                      })
                    }}
                  >
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Período letivo">
                        {selectedFinancialPeriodLabel}
                      </SelectValue>
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

                  <Select
                    value={financialFilters.courseId}
                    onValueChange={(value) => {
                      if (!value) return
                      setFinancialFilters((prev) => ({
                        ...prev,
                        courseId: value,
                        levelId: 'all',
                        classId: 'all',
                      }))
                    }}
                    disabled={financialFilters.academicPeriodId === 'all'}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Curso">{selectedFinancialCourseLabel}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os cursos</SelectItem>
                      {financialCourses.map((course) => (
                        <SelectItem key={course.courseId} value={course.courseId}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={financialFilters.levelId}
                    onValueChange={(value) => {
                      if (!value) return
                      setFinancialFilters((prev) => ({ ...prev, levelId: value, classId: 'all' }))
                    }}
                    disabled={financialFilters.courseId === 'all'}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Nível">{selectedFinancialLevelLabel}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os níveis</SelectItem>
                      {financialLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={financialFilters.classId}
                    onValueChange={(value) => {
                      if (!value) return
                      setFinancialFilters((prev) => ({ ...prev, classId: value }))
                    }}
                    disabled={financialFilters.courseId === 'all'}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Turma">{selectedFinancialClassLabel}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as turmas</SelectItem>
                      {financialClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.levelName} - {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleFinancialInfoVisibility}
                    className="ml-auto gap-2"
                  >
                    {hideFinancialInfo ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    {hideFinancialInfo ? 'Mostrar valores' : 'Ocultar valores'}
                  </Button>
                </div>

                <EscolaInsightsContainer
                  hideFinancialValues={hideFinancialInfo}
                  allowedTypes={['financial']}
                  academicPeriodId={
                    financialFilters.academicPeriodId === 'all'
                      ? undefined
                      : financialFilters.academicPeriodId
                  }
                  courseId={
                    financialFilters.courseId === 'all' ? undefined : financialFilters.courseId
                  }
                  levelId={
                    financialFilters.levelId === 'all' ? undefined : financialFilters.levelId
                  }
                  classId={
                    financialFilters.classId === 'all' ? undefined : financialFilters.classId
                  }
                />

                <EscolaStatsContainer
                  hideFinancialValues={hideFinancialInfo}
                  academicPeriodId={
                    financialFilters.academicPeriodId === 'all'
                      ? undefined
                      : financialFilters.academicPeriodId
                  }
                  courseId={
                    financialFilters.courseId === 'all' ? undefined : financialFilters.courseId
                  }
                  levelId={
                    financialFilters.levelId === 'all' ? undefined : financialFilters.levelId
                  }
                  classId={
                    financialFilters.classId === 'all' ? undefined : financialFilters.classId
                  }
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FinancialRevenueTrendsChart
                    hideFinancialValues={hideFinancialInfo}
                    academicPeriodId={
                      financialFilters.academicPeriodId === 'all'
                        ? undefined
                        : financialFilters.academicPeriodId
                    }
                    courseId={
                      financialFilters.courseId === 'all' ? undefined : financialFilters.courseId
                    }
                    levelId={
                      financialFilters.levelId === 'all' ? undefined : financialFilters.levelId
                    }
                    classId={
                      financialFilters.classId === 'all' ? undefined : financialFilters.classId
                    }
                  />

                  <FinancialOverdueAgingChart
                    hideFinancialValues={hideFinancialInfo}
                    academicPeriodId={
                      financialFilters.academicPeriodId === 'all'
                        ? undefined
                        : financialFilters.academicPeriodId
                    }
                    courseId={
                      financialFilters.courseId === 'all' ? undefined : financialFilters.courseId
                    }
                    levelId={
                      financialFilters.levelId === 'all' ? undefined : financialFilters.levelId
                    }
                    classId={
                      financialFilters.classId === 'all' ? undefined : financialFilters.classId
                    }
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </EscolaLayout>
  )
}
