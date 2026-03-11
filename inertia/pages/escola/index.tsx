import { Head } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { EscolaLayout } from '../../components/layouts'
import { EscolaStatsContainer } from '../../containers/escola-stats-container'
import { EscolaInsightsContainer } from '../../containers/escola-insights-container'
import { EscolaTeacherDashboardContainer } from '../../containers/escola-teacher-dashboard-container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Users, DollarSign, Eye, EyeOff } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useAuthUser } from '../../stores/auth_store'

const HIDE_FINANCIAL_INFO_STORAGE_KEY = 'escola:hide-financial-info'

export default function EscolaDashboard() {
  const user = useAuthUser()
  const isSchoolTeacher = user?.role?.name === 'SCHOOL_TEACHER'
  const [hideFinancialInfo, setHideFinancialInfo] = useState(true)

  useEffect(() => {
    const storedPreference = window.localStorage.getItem(HIDE_FINANCIAL_INFO_STORAGE_KEY)
    if (storedPreference === null) {
      setHideFinancialInfo(true)
      window.localStorage.setItem(HIDE_FINANCIAL_INFO_STORAGE_KEY, 'true')
      return
    }

    setHideFinancialInfo(storedPreference === 'true')
  }, [])

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
          <>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleFinancialInfoVisibility}
                className="gap-2"
              >
                {hideFinancialInfo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {hideFinancialInfo ? 'Mostrar valores' : 'Ocultar valores'}
              </Button>
            </div>

            {/* Stats container with Suspense */}
            <EscolaStatsContainer hideFinancialValues={hideFinancialInfo} />

            {/* Quick actions */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>Acesse as funcionalidades mais usadas</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <a
                    href="/escola/administrativo/alunos"
                    className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors"
                  >
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Gerenciar Alunos</p>
                      <p className="text-sm text-muted-foreground">
                        Cadastrar, editar e visualizar alunos
                      </p>
                    </div>
                  </a>
                  <a
                    href="/escola/financeiro/faturas"
                    className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted transition-colors"
                  >
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Faturas</p>
                      <p className="text-sm text-muted-foreground">
                        Acompanhar pagamentos e cobranças
                      </p>
                    </div>
                  </a>
                </CardContent>
              </Card>

              <EscolaInsightsContainer hideFinancialValues={hideFinancialInfo} />
            </div>
          </>
        )}
      </div>
    </EscolaLayout>
  )
}
