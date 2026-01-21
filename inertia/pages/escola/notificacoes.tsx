import { Head, Link } from '@inertiajs/react'
import { Suspense } from 'react'
import { Settings, Bell } from 'lucide-react'

import { EscolaLayout } from '../../components/layouts'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'

import { NotificationsList } from '../../containers/notifications/notifications-list'

function NotificationsListSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="py-12 text-center">
          <Bell className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            Carregando notificações...
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function NotificacoesPage() {
  return (
    <EscolaLayout>
      <Head title="Notificações" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notificações</h1>
          <Link href="/escola/notificacoes/preferencias">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Preferências
            </Button>
          </Link>
        </div>

        <Suspense fallback={<NotificationsListSkeleton />}>
          <NotificationsList />
        </Suspense>
      </div>
    </EscolaLayout>
  )
}
