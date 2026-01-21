import { useSuspenseQuery } from '@tanstack/react-query'
import { Building, Plus, MoreHorizontal, School, Users } from 'lucide-react'

import { useSchoolChainsQueryOptions } from '../../hooks/queries/use-school-chains'
import { useDeleteSchoolChain } from '../../hooks/mutations/use-school-chain-mutations'

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

interface SchoolChainsTableProps {
  onCreateChain?: () => void
  onViewSchools?: (chainId: string) => void
}

export function SchoolChainsTable({ onCreateChain, onViewSchools }: SchoolChainsTableProps) {
  const { data } = useSuspenseQuery(useSchoolChainsQueryOptions({}))
  const deleteMutation = useDeleteSchoolChain()

  const chains = Array.isArray(data) ? data : data?.data || []

  if (chains.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma rede cadastrada</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Redes de escolas permitem gerenciar múltiplas unidades
          </p>
          {onCreateChain && (
            <Button className="mt-4" onClick={onCreateChain}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Rede
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
          <CardTitle>Redes de Escolas</CardTitle>
          <CardDescription>{chains.length} rede(s) cadastrada(s)</CardDescription>
        </div>
        {onCreateChain && (
          <Button onClick={onCreateChain}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Rede
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead className="text-center">Escolas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chains.map((chain: any) => (
              <TableRow key={chain.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{chain.name}</p>
                      {chain.legalName && (
                        <p className="text-sm text-muted-foreground">{chain.legalName}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{chain.cnpj || '-'}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="gap-1">
                    <School className="h-3 w-3" />
                    {chain.schools?.length || 0}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={chain.active ? 'default' : 'secondary'}>
                    {chain.active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewSchools?.(chain.id)}>
                        Ver Escolas
                      </DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Ver Assinatura</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(chain.id)}
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
