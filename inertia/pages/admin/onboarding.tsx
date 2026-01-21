import { AdminLayout } from '../../components/layouts/admin-layout'
import { SchoolOnboardingForm } from '../../containers/onboarding/school-onboarding-form'

export default function OnboardingPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Onboarding de Escolas</h1>
          <p className="text-muted-foreground">Configure novas escolas no sistema</p>
        </div>

        <SchoolOnboardingForm />
      </div>
    </AdminLayout>
  )
}
