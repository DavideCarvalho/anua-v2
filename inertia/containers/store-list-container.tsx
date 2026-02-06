import { useState } from 'react'
import { Link } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { Plus, MoreHorizontal, Pencil } from 'lucide-react'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { Badge } from '../components/ui/badge'
import { CreateStoreModal } from './stores/create-store-modal'
import { useStoresQueryOptions, type StoresResponse } from '../hooks/queries/use_stores'

type Store = StoresResponse['data'][number]

export function StoreListContainer() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const { data, isLoading, refetch } = useQuery(useStoresQueryOptions())

  const stores: Store[] = data?.data ?? []

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Todas as Lojas</CardTitle>
            <CardDescription>
              Lojas internas e terceirizadas da instituicao
            </CardDescription>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Loja
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !stores.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma loja cadastrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Dono</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>
                      <Link
                        href={`/escola/lojas/${store.id}`}
                        className="font-medium hover:underline"
                      >
                        {store.name}
                      </Link>
                      {store.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {store.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={store.type === 'INTERNAL' ? 'default' : 'secondary'}>
                        {store.type === 'INTERNAL' ? 'Interna' : 'Terceirizada'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {store.owner?.name ?? (store.type === 'INTERNAL' ? 'Escola' : '\u2014')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={store.isActive ? 'default' : 'outline'}>
                        {store.isActive ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/escola/lojas/${store.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateStoreModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          setCreateModalOpen(false)
          refetch()
        }}
      />
    </>
  )
}
