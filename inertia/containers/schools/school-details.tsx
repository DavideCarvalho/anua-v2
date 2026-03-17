import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import {
  Building2,
  ArrowLeft,
  Pencil,
  MapPin,
  Globe,
  Calendar,
  UserCheck,
  GraduationCap,
  Shield,
  ExternalLink,
  Users,
} from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { api } from '~/lib/api'

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

export function SchoolDetails({ schoolId }: { schoolId: string }) {
  const queryClient = useQueryClient()
  const { data: school, isLoading } = useQuery(
    api.api.v1.schools.show.queryOptions({ params: { id: schoolId } })
  )
  const setImpersonationMutation = useMutation(api.api.v1.impersonation.set.mutationOptions())

  const handleImpersonate = async (userId: string, userName: string, userRole: string) => {
    try {
      const data = await setImpersonationMutation.mutateAsync({
        body: { userId },
      })

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

  const formatAddress = () => {
    const parts = [
      school?.street,
      school?.number,
      school?.complement,
      school?.neighborhood,
      school?.city && school?.state
        ? `${school.city}/${school.state}`
        : school?.city || school?.state,
    ].filter(Boolean)

    if (parts.length === 0) return null

    let address = parts.join(', ')
    if (school?.zipCode) {
      address += ` - CEP ${school.zipCode}`
    }
    return address
  }

  const getGoogleMapsUrl = () => {
    if (school?.latitude && school?.longitude) {
      return `https://www.google.com/maps?q=${school.latitude},${school.longitude}`
    }
    const address = formatAddress()
    if (address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    }
    return null
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Não informado'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const users = school?.users || []
  const displayUsers = users.slice(0, 10)
  const hasMoreUsers = users.length > 10

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {isLoading ? (
                <div className="h-16 w-16 rounded-lg bg-muted animate-pulse" />
              ) : school?.logoUrl ? (
                <img
                  src={school.logoUrl}
                  alt={school.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                {isLoading ? (
                  <>
                    <div className="h-7 w-48 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-32 bg-muted animate-pulse rounded mt-1" />
                  </>
                ) : (
                  <>
                    <CardTitle className="text-2xl">{school?.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Globe className="h-3 w-3" />
                      {school?.slug}
                    </CardDescription>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.visit('/admin/escolas')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button onClick={() => router.visit(`/admin/escolas/${schoolId}/editar`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Slug</p>
                {isLoading ? (
                  <div className="h-5 w-24 bg-muted animate-pulse rounded mt-1" />
                ) : (
                  <p className="font-medium">{school?.slug}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Criado em</p>
                {isLoading ? (
                  <div className="h-5 w-28 bg-muted animate-pulse rounded mt-1" />
                ) : (
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(school?.createdAt)}
                  </p>
                )}
              </div>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              </div>
            ) : school?.schoolChain ? (
              <div>
                <p className="text-sm text-muted-foreground">Rede de Ensino</p>
                <p className="font-medium">{school.schoolChain.name}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-5 w-full bg-muted animate-pulse rounded" />
                <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
              </div>
            ) : formatAddress() ? (
              <div className="space-y-3">
                <p className="font-medium">{formatAddress()}</p>
                {getGoogleMapsUrl() && (
                  <a
                    href={getGoogleMapsUrl()!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Ver no Google Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Endereço não informado</p>
            )}
          </CardContent>
        </Card>

        {/* Configurações Acadêmicas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Configurações Acadêmicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nota Mínima</p>
                {isLoading ? (
                  <div className="h-7 w-12 bg-muted animate-pulse rounded mt-1" />
                ) : (
                  <p className="font-medium text-lg">{school?.minimumGrade ?? 7}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Frequência Mínima</p>
                {isLoading ? (
                  <div className="h-7 w-16 bg-muted animate-pulse rounded mt-1" />
                ) : (
                  <p className="font-medium text-lg">
                    {school?.minimumAttendancePercentage ?? 75}%
                  </p>
                )}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Algoritmo de Cálculo</p>
              {isLoading ? (
                <div className="h-5 w-16 bg-muted animate-pulse rounded mt-1" />
              ) : (
                <p className="font-medium">
                  {school?.calculationAlgorithm === 'AVERAGE' ? 'Média' : 'Soma'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seguro de Inadimplência */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguro de Inadimplência
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-5 w-12 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-5 w-12 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ) : school?.hasInsurance ? (
              <div className="space-y-4">
                <Badge variant="default">Ativo</Badge>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Percentual</p>
                    <p className="font-medium">{school.insurancePercentage}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cobertura</p>
                    <p className="font-medium">{school.insuranceCoveragePercentage ?? 100}%</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dias para Acionamento</p>
                  <p className="font-medium">{school.insuranceClaimWaitingDays ?? 90} dias</p>
                </div>
              </div>
            ) : (
              <div>
                <Badge variant="secondary">Inativo</Badge>
                <p className="mt-2 text-sm text-muted-foreground">
                  O seguro de inadimplência não está habilitado para esta escola.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usuários Vinculados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários Vinculados
          </CardTitle>
          {isLoading ? (
            <div className="h-4 w-48 bg-muted animate-pulse rounded mt-1" />
          ) : (
            <CardDescription>{users.length} usuário(s) vinculado(s) a esta escola</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 flex-1 bg-muted animate-pulse rounded" />
                  <div className="h-10 flex-1 bg-muted animate-pulse rounded" />
                  <div className="h-10 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-10 w-28 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Users className="mx-auto h-8 w-8 mb-2" />
              <p>Nenhum usuário vinculado a esta escola</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayUsers.map(
                    (user: {
                      id: string
                      name: string
                      email: string | null
                      role: string | null
                    }) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{translateRole(user.role ?? '-')}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleImpersonate(user.id, user.name, user.role ?? '')}
                            disabled={setImpersonationMutation.isPending}
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Personificar
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
              {hasMoreUsers && (
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm">
                    Ver todos os {users.length} usuários
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
