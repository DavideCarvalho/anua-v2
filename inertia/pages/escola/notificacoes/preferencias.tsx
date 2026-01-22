import { Head } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { Suspense } from 'react'
import { ArrowLeft, Settings } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'

import { NotificationPreferences } from '../../../containers/notifications/notification-preferences'

function PreferencesSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="py-12 text-center">
          <Settings className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            Carregando preferências...
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function NotificacoesPreferenciasPage() {
  return (
    <EscolaLayout>
      <Head title="Preferências de Notificação" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link route="web.escola.notificacoes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Preferências de Notificação</h1>
        </div>

        <Suspense fallback={<PreferencesSkeleton />}>
          <NotificationPreferences />
        </Suspense>
      </div>
    </EscolaLayout>
  )
}
