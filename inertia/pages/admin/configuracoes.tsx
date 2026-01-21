import { Head } from '@inertiajs/react'
import { Suspense } from 'react'
import { Settings } from 'lucide-react'

import { AdminLayout } from '../../components/layouts'
import { Card, CardContent } from '../../components/ui/card'
import { PlatformSettingsForm } from '../../containers/settings/platform-settings-form'

function SettingsFormSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="py-12 text-center">
          <Settings className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Carregando configurações...</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ConfiguracoesPage() {
  return (
    <AdminLayout>
      <Head title="Configurações da Plataforma" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações da Plataforma</h1>
          <p className="text-muted-foreground">Gerencie as configurações globais do sistema</p>
        </div>

        <Suspense fallback={<SettingsFormSkeleton />}>
          <PlatformSettingsForm />
        </Suspense>
      </div>
    </AdminLayout>
  )
}
