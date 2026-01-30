import { Head, usePage, router } from '@inertiajs/react'
import { useState } from 'react'
import { User, Mail, Phone, MapPin, Shield, Pencil } from 'lucide-react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useUpdateProfile } from '../../hooks/mutations/use_update_profile'
import type { SharedProps } from '../../lib/types'

export default function PerfilPage() {
  const { props } = usePage<SharedProps>()
  const user = props.user

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')

  const updateProfile = useUpdateProfile()

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    updateProfile.mutate(
      { name: name.trim(), phone: phone.trim() || undefined },
      {
        onSuccess: () => {
          setEditDialogOpen(false)
          router.reload()
        },
      }
    )
  }

  const handleOpenEditDialog = () => {
    setName(user?.name || '')
    setPhone(user?.phone || '')
    setEditDialogOpen(true)
  }

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
              {(user as any)?.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{(user as any).address}</span>
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

              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2" onClick={handleOpenEditDialog}>
                    <Pencil className="h-4 w-4" />
                    Editar Perfil
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleEditProfile}>
                    <DialogHeader>
                      <DialogTitle>Editar Perfil</DialogTitle>
                      <DialogDescription>
                        Atualize suas informacoes pessoais
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Seu nome completo"
                          required
                          minLength={2}
                          maxLength={255}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user?.email || ''} disabled />
                        <p className="text-xs text-muted-foreground">
                          O email nao pode ser alterado
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={updateProfile.isPending}>
                        {updateProfile.isPending ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
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
            <CardDescription>Informacoes sobre a seguranca da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Metodo de login</p>
                <p className="text-sm text-muted-foreground">Codigo de verificacao por email</p>
              </div>
              <Badge variant="secondary">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Email verificado</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Badge variant="secondary">Verificado</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsavelLayout>
  )
}
