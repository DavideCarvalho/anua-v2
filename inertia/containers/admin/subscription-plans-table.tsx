import { useSuspenseQuery } from '@tanstack/react-query'
import { Package, Plus, MoreHorizontal, Users, GraduationCap, Building2 } from 'lucide-react'

import { useSubscriptionPlansQueryOptions } from '../../hooks/queries/use_subscription_plans'
import { useDeleteSubscriptionPlan } from '../../hooks/mutations/use_subscription_mutations'

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
import { Switch } from '../../components/ui/switch'

interface SubscriptionPlansTableProps {
  onCreatePlan?: () => void
}

const tierColors: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-700',
  BASIC: 'bg-blue-100 text-blue-700',
  PROFESSIONAL: 'bg-purple-100 text-purple-700',
  ENTERPRISE: 'bg-amber-100 text-amber-700',
  CUSTOM: 'bg-pink-100 text-pink-700',
}

export function SubscriptionPlansTable({ onCreatePlan }: SubscriptionPlansTableProps) {
  const { data } = useSuspenseQuery(useSubscriptionPlansQueryOptions({}))
  const deleteMutation = useDeleteSubscriptionPlan()

  const plans = Array.isArray(data) ? data : data?.data || []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum plano cadastrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie planos de assinatura para as escolas
          </p>
          {onCreatePlan && (
            <Button className="mt-4" onClick={onCreatePlan}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Plano
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
          <CardTitle>Planos de Assinatura</CardTitle>
          <CardDescription>{plans.length} plano(s) cadastrado(s)</CardDescription>
        </div>
        {onCreatePlan && (
          <Button onClick={onCreatePlan}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Plano
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plano</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="text-right">Mensal</TableHead>
              <TableHead className="text-right">Anual</TableHead>
              <TableHead className="text-center">Limites</TableHead>
              <TableHead className="text-center">Ativo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan: any) => (
              <TableRow key={plan.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{plan.name}</p>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {plan.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={tierColors[plan.tier] || tierColors.CUSTOM}>
                    {plan.tier}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(plan.monthlyPrice)}
                </TableCell>
                <TableCell className="text-right">
                  {plan.annualPrice ? formatCurrency(plan.annualPrice) : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1" title="Max Alunos">
                      <Users className="h-3 w-3" />
                      {plan.maxStudents || '∞'}
                    </span>
                    <span className="flex items-center gap-1" title="Max Professores">
                      <GraduationCap className="h-3 w-3" />
                      {plan.maxTeachers || '∞'}
                    </span>
                    <span className="flex items-center gap-1" title="Max Escolas na Rede">
                      <Building2 className="h-3 w-3" />
                      {plan.maxSchoolsInChain || '∞'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Switch checked={plan.isActive} disabled />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Ver Assinaturas</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(plan.id)}
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
