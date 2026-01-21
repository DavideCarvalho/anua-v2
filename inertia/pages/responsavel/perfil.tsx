import { Head, usePage } from '@inertiajs/react'
import { User, Mail, Phone, MapPin, Shield } from 'lucide-react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import type { SharedProps } from '../../lib/types'

export default function PerfilPage() {
  const { props } = usePage<SharedProps>()
  const user = props.user

  return (
    <ResponsavelLayout>
      <Head title="Perfil" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <User className="h-6 w-6" />
            Meu Perfil
          </h1>
          <p className="text-muted-foreground">Visualize e gerencie suas informacoes</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <CardTitle>{user?.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Responsavel
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user?.email}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user?.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{user.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configuracoes da Conta</CardTitle>
              <CardDescription>Gerencie suas preferencias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Notificacoes por Email</p>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizacoes importantes por email
                  </p>
                </div>
                <Badge variant="outline">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Notificacoes Push</p>
                  <p className="text-sm text-muted-foreground">
                    Receba notificacoes no navegador
                  </p>
                </div>
                <Badge variant="outline">Ativo</Badge>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Editar Perfil (em breve)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguranca
            </CardTitle>
            <CardDescription>Gerencie a seguranca da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Alterar Senha</p>
                <p className="text-sm text-muted-foreground">
                  Atualize sua senha periodicamente para maior seguranca
                </p>
              </div>
              <Button variant="outline" disabled>
                Alterar (em breve)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsavelLayout>
  )
}
