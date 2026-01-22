import { Head, router } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { Suspense, useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Building2,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
} from 'lucide-react'

import { AdminLayout } from '../../components/layouts'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
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

import { useSchoolsQueryOptions } from '../../hooks/queries/use-schools'

interface School {
  id: string
  name: string
  slug: string
}

function EscolasContent({ search }: { search: string }) {
  const { data } = useSuspenseQuery(
    useSchoolsQueryOptions({ search: search || undefined })
  )
  const schools: School[] = Array.isArray(data) ? data : data?.data || []

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
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools.map((school) => (
              <TableRow key={school.id}>
                <TableCell className="font-medium">
                  <button
                    onClick={() => router.visit(`/admin/escolas/${school.id}`)}
                    className="text-left hover:underline hover:text-primary transition-colors"
                  >
                    {school.name}
                  </button>
                </TableCell>
                <TableCell className="text-muted-foreground">{school.slug}</TableCell>
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
                      <DropdownMenuItem onClick={() => router.visit(`/admin/escolas/${school.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.visit(`/admin/escolas/${school.id}/editar`)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
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
