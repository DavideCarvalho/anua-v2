import { Head } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { Suspense, useState } from 'react'
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  UserCheck,
  Pencil,
  Power,
  Users,
  MapPin,
  Hash,
  Globe,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

import { AdminLayout } from '../../components/layouts'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Label } from '../../components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { ScrollArea } from '../../components/ui/scroll-area'

import { useSchoolsQueryOptions } from '../../hooks/queries/use-schools'
import { useSetImpersonation } from '../../hooks/mutations/use-impersonation-mutations'
import { useUpdateSchool } from '../../hooks/mutations/use-school-mutations'

// Traduções dos cargos
const ROLE_TRANSLATIONS: Record<string, string> = {
  SCHOOL_DIRECTOR: 'Diretor(a)',
  SCHOOL_COORDINATOR: 'Coordenador(a)',
  SCHOOL_ADMIN: 'Admin',
  SCHOOL_ADMINISTRATIVE: 'Administrativo',
  SCHOOL_TEACHER: 'Professor(a)',
  SCHOOL_CANTEEN: 'Cantina',
}

function translateRole(roleName: string): string {
  return ROLE_TRANSLATIONS[roleName] || roleName
}

interface SchoolUser {
  id: string
  name: string
  email: string | null
  role: string
}

interface School {
  id: string
  name: string
  slug: string
  cnpj: string | null
  active: boolean
  street: string | null
  number: string | null
  complement: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  users?: SchoolUser[]
}

function ImpersonateUserDialog({
  school,
  open,
  onOpenChange,
}: {
  school: School | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const setImpersonationMutation = useSetImpersonation()

  const handleImpersonate = async (userId: string, userName: string, userRole: string) => {
    try {
      const data = await setImpersonationMutation.mutateAsync({ userId })

      if (data?.success) {
        toast.success(`Personificando: ${userName} (${translateRole(userRole)})`)
        await queryClient.invalidateQueries()
        window.location.href = '/escola'
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao ativar personificação'
      toast.error(message)
    }
  }

  if (!school) return null

  const users = school.users || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Personificar Usuário</DialogTitle>
          <DialogDescription>
            Selecione um usuário de {school.name} para personificar
          </DialogDescription>
        </DialogHeader>

        {users.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Users className="mx-auto h-8 w-8 mb-2" />
            <p>Nenhum usuário encontrado nesta escola</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleImpersonate(user.id, user.name, user.role)}
                  disabled={setImpersonationMutation.isPending}
                  className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-accent disabled:opacity-50"
                >
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email} • {translateRole(user.role)}
                    </div>
                  </div>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}

function SchoolDetailsDialog({
  school,
  open,
  onOpenChange,
}: {
  school: School | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!school) return null

  const formatAddress = () => {
    const parts = [
      school.street,
      school.number,
      school.complement,
      school.neighborhood,
      school.city,
      school.state,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'Endereço não informado'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {school.name}
          </DialogTitle>
          <DialogDescription>Detalhes da escola</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs">Status</Label>
              <div className="mt-1">
                <Badge variant={school.active ? 'default' : 'secondary'}>
                  {school.active ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Slug</Label>
              <div className="mt-1 flex items-center gap-1 text-sm">
                <Globe className="h-3 w-3" />
                {school.slug}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">CNPJ</Label>
            <div className="mt-1 flex items-center gap-1 text-sm">
              <Hash className="h-3 w-3" />
              {school.cnpj || 'Não informado'}
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Endereço</Label>
            <div className="mt-1 flex items-center gap-1 text-sm">
              <MapPin className="h-3 w-3" />
              {formatAddress()}
            </div>
            {school.zipCode && (
              <div className="mt-1 text-xs text-muted-foreground">CEP: {school.zipCode}</div>
            )}
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Usuários</Label>
            <div className="mt-1 flex items-center gap-1 text-sm">
              <Users className="h-3 w-3" />
              {school.users?.length || 0} usuário(s) vinculado(s)
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditSchoolDialog({
  school,
  open,
  onOpenChange,
}: {
  school: School | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateSchoolMutation = useUpdateSchool()
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    cnpj: '',
  })

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && school) {
      setFormData({
        name: school.name,
        slug: school.slug,
        cnpj: school.cnpj || '',
      })
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!school) return

    try {
      await updateSchoolMutation.mutateAsync({
        id: school.id,
        name: formData.name,
        slug: formData.slug,
        cnpj: formData.cnpj || undefined,
      })
      toast.success('Escola atualizada com sucesso')
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar escola'
      toast.error(message)
    }
  }

  if (!school) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Escola</DialogTitle>
          <DialogDescription>Altere os dados básicos da escola</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-slug">Slug</Label>
            <Input
              id="edit-slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-cnpj">CNPJ</Label>
            <Input
              id="edit-cnpj"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateSchoolMutation.isPending}>
              {updateSchoolMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ToggleActiveDialog({
  school,
  open,
  onOpenChange,
}: {
  school: School | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateSchoolMutation = useUpdateSchool()

  const handleToggle = async () => {
    if (!school) return

    try {
      await updateSchoolMutation.mutateAsync({
        id: school.id,
        active: !school.active,
      })
      toast.success(`Escola ${school.active ? 'desativada' : 'ativada'} com sucesso`)
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao alterar status da escola'
      toast.error(message)
    }
  }

  if (!school) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {school.active ? 'Desativar' : 'Ativar'} escola?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {school.active
              ? `Ao desativar "${school.name}", os usuários não poderão mais acessar o sistema.`
              : `Ao ativar "${school.name}", os usuários poderão acessar o sistema novamente.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleToggle}
            disabled={updateSchoolMutation.isPending}
            className={school.active ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {updateSchoolMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {school.active ? 'Desativar' : 'Ativar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function EscolasContent({ search }: { search: string }) {
  const { data } = useSuspenseQuery(
    useSchoolsQueryOptions({ search: search || undefined, includeUsers: true })
  )
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [impersonateDialogOpen, setImpersonateDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [toggleActiveDialogOpen, setToggleActiveDialogOpen] = useState(false)

  const schools: School[] = Array.isArray(data) ? data : data?.data || []

  const handleOpenImpersonateDialog = (school: School) => {
    setSelectedSchool(school)
    setImpersonateDialogOpen(true)
  }

  const handleOpenDetailsDialog = (school: School) => {
    setSelectedSchool(school)
    setDetailsDialogOpen(true)
  }

  const handleOpenEditDialog = (school: School) => {
    setSelectedSchool(school)
    setEditDialogOpen(true)
  }

  const handleOpenToggleActiveDialog = (school: School) => {
    setSelectedSchool(school)
    setToggleActiveDialogOpen(true)
  }

  if (schools.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma escola encontrada</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search ? 'Tente ajustar os filtros de busca' : 'Cadastre a primeira escola'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Escolas Cadastradas</CardTitle>
          <CardDescription>{schools.length} escola(s) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell className="text-muted-foreground">{school.slug}</TableCell>
                  <TableCell>{school.cnpj || '-'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={school.active ? 'default' : 'secondary'}>
                      {school.active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOpenImpersonateDialog(school)}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Personificar Usuário
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDetailsDialog(school)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEditDialog(school)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOpenToggleActiveDialog(school)}>
                          <Power className="mr-2 h-4 w-4" />
                          {school.active ? 'Desativar' : 'Ativar'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ImpersonateUserDialog
        school={selectedSchool}
        open={impersonateDialogOpen}
        onOpenChange={setImpersonateDialogOpen}
      />

      <SchoolDetailsDialog
        school={selectedSchool}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />

      <EditSchoolDialog
        school={selectedSchool}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <ToggleActiveDialog
        school={selectedSchool}
        open={toggleActiveDialogOpen}
        onOpenChange={setToggleActiveDialogOpen}
      />
    </>
  )
}

function EscolasSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminEscolasPage() {
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  return (
    <AdminLayout>
      <Head title="Escolas - Admin" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Escolas
            </h1>
            <p className="text-muted-foreground">Gerencie as escolas cadastradas na plataforma</p>
          </div>
          <Link route="web.admin.onboarding">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Escola
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar escolas..."
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput)}
            />
          </div>
          <Button variant="secondary" onClick={() => setSearch(searchInput)}>
            Buscar
          </Button>
        </div>

        <Suspense fallback={<EscolasSkeleton />}>
          <EscolasContent search={search} />
        </Suspense>
      </div>
    </AdminLayout>
  )
}
