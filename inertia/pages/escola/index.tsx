import { Head } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { EscolaLayout } from '../../components/layouts'
import { EscolaStatsContainer } from '../../containers/escola-stats-container'
import { EscolaInsightsContainer } from '../../containers/escola-insights-container'
import { EscolaTeacherDashboardContainer } from '../../containers/escola-teacher-dashboard-container'
import { PedagogicalAlertsCards } from '../../containers/dashboard/pedagogical-alerts-cards'
import { EnrollmentFunnelStats } from '../../containers/enrollment-analytics/enrollment-funnel-stats'
import { EnrollmentTrendsChart } from '../../containers/enrollment-analytics/enrollment-trends-chart'
import { EnrollmentByLevelTable } from '../../containers/enrollment-analytics/enrollment-by-level-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { GraduationCap, LineChart, DollarSign, Eye, EyeOff } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useAuthUser } from '../../stores/auth_store'

const HIDE_FINANCIAL_INFO_STORAGE_KEY = 'escola:hide-financial-info'

type DashboardTab = 'pedagogical' | 'administrative' | 'financial'

export default function EscolaDashboard() {
  const user = useAuthUser()
  const roleName = user?.role?.name
  const schoolId = user?.school?.id
  const isSchoolTeacher = roleName === 'SCHOOL_TEACHER'
  const canViewFinancialTab = roleName === 'SCHOOL_ADMIN' || roleName === 'SCHOOL_CHAIN_DIRECTOR'
  const canViewAdministrativeTab = !isSchoolTeacher
  const tabColumnClass = canViewFinancialTab ? 'md:grid-cols-3' : 'md:grid-cols-2'
  const [hideFinancialInfo, setHideFinancialInfo] = useState(true)
  const [activeTab, setActiveTab] = useState<DashboardTab>('pedagogical')

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

  return (
    <EscolaLayout>
      <Head title="Dashboard" />

      <div className="space-y-6">
        {/* Welcome section */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Olá, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao painel da {user?.school?.name || 'escola'}
          </p>
        </div>

        {isSchoolTeacher ? (
          <EscolaTeacherDashboardContainer />
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
              <PedagogicalAlertsCards />

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Ações Pedagógicas</CardTitle>
                    <CardDescription>
                      Acesse rapidamente o acompanhamento pedagógico
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    <a
                      href="/escola/pedagogico/presenca"
                      className="rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      Frequência e presenças
                    </a>
                    <a
                      href="/escola/desempenho"
                      className="rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      Desempenho acadêmico completo
                    </a>
                  </CardContent>
                </Card>

                <EscolaInsightsContainer allowedTypes={['academic']} />
              </div>
            </TabsContent>

            {canViewAdministrativeTab && (
              <TabsContent value="administrative" className="mt-6 space-y-6">
                <EnrollmentFunnelStats schoolId={schoolId} />
                <EnrollmentTrendsChart schoolId={schoolId} days={30} />
                <EnrollmentByLevelTable schoolId={schoolId} />

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ações Administrativas</CardTitle>
                      <CardDescription>Fluxos para matrícula e documentação</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                      <a
                        href="/escola/administrativo/matriculas"
                        className="rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-muted"
                      >
                        Gestão de matrículas
                      </a>
                      <a
                        href="/escola/administrativo/alunos"
                        className="rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-muted"
                      >
                        Alunos e pendências
                      </a>
                    </CardContent>
                  </Card>

                  <EscolaInsightsContainer allowedTypes={['enrollment']} />
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

                <EscolaStatsContainer hideFinancialValues={hideFinancialInfo} />

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ações Financeiras</CardTitle>
                      <CardDescription>Operação de cobrança e recebimentos</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                      <a
                        href="/escola/financeiro/faturas"
                        className="rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-muted"
                      >
                        Faturas
                      </a>
                      <a
                        href="/escola/financeiro/inadimplencia"
                        className="rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-muted"
                      >
                        Inadimplência
                      </a>
                    </CardContent>
                  </Card>

                  <EscolaInsightsContainer
                    hideFinancialValues={hideFinancialInfo}
                    allowedTypes={['financial']}
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
