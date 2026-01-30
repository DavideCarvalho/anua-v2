import { useSuspenseQuery } from '@tanstack/react-query'
import { Users, Plus, MoreHorizontal } from 'lucide-react'

import { useSchoolGroupsQueryOptions } from '../../hooks/queries/use_school_groups'
import { useDeleteSchoolGroup } from '../../hooks/mutations/use_school_chain_mutations'

import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
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
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'

interface SchoolGroupsTableProps {
  schoolChainId?: string
  onCreateGroup?: () => void
}

export function SchoolGroupsTable({ schoolChainId, onCreateGroup }: SchoolGroupsTableProps) {
  const { data } = useSuspenseQuery(useSchoolGroupsQueryOptions({ schoolChainId }))
  const deleteMutation = useDeleteSchoolGroup()

  const groups = Array.isArray(data) ? data : (data as any)?.data || []

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum grupo cadastrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Grupos permitem organizar escolas em categorias
          </p>
          {onCreateGroup && (
            <Button className="mt-4" onClick={onCreateGroup}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Grupo
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Grupos de Escolas</CardTitle>
          <CardDescription>{groups.length} grupo(s) cadastrado(s)</CardDescription>
        </div>
        {onCreateGroup && (
          <Button onClick={onCreateGroup}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Grupo
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Rede</TableHead>
              <TableHead className="text-center">Escolas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group: any) => (
              <TableRow key={group.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{group.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                  {group.description || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{group.schoolChain?.name || '-'}</Badge>
                </TableCell>
                <TableCell className="text-center">{group.schools?.length || 0}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Ver Escolas</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(group.id)}
                      >
                        Excluir
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
